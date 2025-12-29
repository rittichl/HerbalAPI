import { Request, Response } from 'express';
import QuarantineList from '../models/quarantineList.model';
import msg from '../constants/msg.json';
import Order from '../models/order.model';
import { Material } from '../models/material.model';
import AuditStatus from '../models/auditStatus.model';
import User from '../models/user.model';
import sequelize from '../config/database';
import OrderDetail from '../models/orderDetail.model';
import { Op } from 'sequelize';
import { isValidMaterialUnit } from '../utility/util.function';
import { MaterialUnit } from '../constants/enum.data';
import InspectionTopic from '../models/inspectionTopic.model';
import OrderDetailInspectionResult from '../models/orderDetailInspectionResult.model';


function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());  // Returns true if the date is valid, false otherwise
}

function isNotOlderThanToday(dateString: string): boolean {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
}

export const quarantineListController = {
    generateQTNumber: async (year: number, month: string, day: string): Promise<string> => {
        const lastOrder = await QuarantineList.findOne({
            where: {
                qt_id: {
                    [Op.like]: `QT-${year}${month}${day}-%`
                }
            },
            order: [['order_id', 'DESC']],
        });

        const lastNumber = lastOrder ?
            parseInt(lastOrder.order_id.split('-')[2]) : 0;
        const newNumber = (lastNumber + 1).toString().padStart(4, '0');

        return `QT-${year}${month}${day}-${newNumber}`;
    },


    // Create new quarantine record
    createQuarantine: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();

        try {
            const {
                order_id,
                material_id,
                amount,
                unit,
                due_date,
                audit_status,
                auditor,
                inspector,
                admit_date
            } = req.body;

            // Basic validation
            if (!order_id || !material_id || !amount || !due_date) {
                return res.status(400).json({
                    code: 400,
                    message: "Required fields: order_id, material_id, amount, due_date"
                });
            }

            // console.log("'auditor', 'inspector' ", auditor)

            const existingQuarantineEntryForMaterialInOrder = await QuarantineList.findOne({
                where: {
                    order_id: order_id,
                    material_id: material_id
                },
                transaction
            });

            if (existingQuarantineEntryForMaterialInOrder) {
                await transaction.rollback();
                return res.json({
                    code: 107, // Assuming 107 for existing ID/combination
                    message: msg["107"],
                    detail: `Material ID ${material_id} is already quarantined for Order ID ${order_id}.`
                });
            }



            // 2. Check if order exists
            const order = await Order.findByPk(order_id, { transaction });
            if (!order) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Order not found"
                });
            }

            // 3. Check if material exists in order details
            const orderDetail = await OrderDetail.findOne({
                where: {
                    order_id,
                    material_id
                },
                transaction
            });

            if (!orderDetail) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Material not found in this order"
                });
            }


            // 4. Validate amount doesn't exceed ordered quantity
            if (amount <= 0) {
                await transaction.rollback();
                return res.json({
                    code: 108,
                    message: "Quarantine amount exceeds ordered quantity",
                    detail: `Ordered: ${orderDetail.amount} ${orderDetail.order_unit}, Requested: ${amount} ${unit}`
                });
            }

            // 5. Validate auditor/inspector exists if provided
            if (auditor) {
                const auditorUser = await User.findByPk(auditor, { transaction });
                if (!auditorUser) {
                    await transaction.rollback();
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: "Auditor user not found"
                    });
                }
            }


            if (inspector) {
                const inspectorUser = await User.findByPk(inspector, { transaction });
                if (!inspectorUser) {
                    await transaction.rollback();
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: "Inspector user not found"
                    });
                }
            }


            // 3. Check if material exists in order details
            const auditstatus = await AuditStatus.findByPk(audit_status);
            if (!auditstatus) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Audit Status not found"
                });
            }

            console.log("admit_date: ", admit_date)

            if (!isValidDate(admit_date) || !isNotOlderThanToday(admit_date)) {
                return res.json({ code: 111, message: msg["111"], detail: `admit_date wrong date data` });
            }

            // Generate QT number
            // 6. Generate qt_id
            const date = new Date(admit_date);
            const month = date.getMonth() + 1;
            const formattedMonth = month.toString().padStart(2, '0');
            const day = date.getDate();
            const formattedDay = day.toString().padStart(2, '0');
            const year = date.getFullYear();  // This will return 2025

            console.log
            const qt_id = await quarantineListController.generateQTNumber(year, formattedMonth, formattedDay);
            // console.log("Generated qt_id: ", qt_id);
            // const currentYear = new Date().getFullYear();
            // const lastRecord = await QuarantineList.findOne({
            //     where: {
            //         qt_id: {
            //             [Op.like]: `QT-${currentYear}-%`
            //         }
            //     },
            //     order: [['qt_id', 'DESC']],
            //     transaction
            // });

            // let runningNumber = 1;
            // if (lastRecord) {
            //     const lastNumber = parseInt(lastRecord.qt_id.split('-')[2]);
            //     runningNumber = lastNumber + 1;
            // }

            // const qt_id = `QT-${currentYear}-${runningNumber.toString().padStart(6, '0')}`

            // Create the record (qt_id will be auto-generated)
            // 6. Create the quarantine record
            const quarantineData: any = {
                order_id,
                material_id,
                amount,
                unit,
                due_date,
                audit_status,
                admit_date,
                qt_id,
                // Only include if provided
                ...(auditor !== undefined && { auditor }),
                ...(inspector !== undefined && { inspector })
            };

            // const quarantine = await QuarantineList.create(quarantineData, {
            //     transaction
            // });

            const newQuarantineEntry = await QuarantineList.create(quarantineData, { transaction });


            // --- NEW LOGIC: Automatically create inspection results for all topics of this material ---
            // Fetch all inspection topics associated with the material
            const materialWithTopics = await Material.findByPk(material_id, {
                include: [{
                    model: InspectionTopic,
                    as: 'inspectionTopics', // This alias must match db.ts
                    through: { attributes: [] } // Don't need junction table attributes here
                }],
                transaction // Ensure this query is also part of the transaction
            });

            if (materialWithTopics && materialWithTopics.inspectionTopics && materialWithTopics.inspectionTopics.length > 0) {
                // Prepare inspection results for bulk creation
                const inspectionResultsToCreate = materialWithTopics.inspectionTopics.map(topic => ({
                    quarantineListId: newQuarantineEntry.id, // Link to the newly created quarantine entry
                    inspectionTopicId: topic.id,
                    result: 0, // Default to 0 (not pass)
                }));

                // Create all inspection results within the same transaction
                await OrderDetailInspectionResult.bulkCreate(inspectionResultsToCreate, { transaction });
            }
            // --- END NEW LOGIC ---

            await transaction.commit();

            return res.status(201).json({
                code: 0,
                message: msg["0"],
                data: newQuarantineEntry
            });

        } catch (error) {
            console.error('Error creating quarantine record:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    // Get all quarantine records
    getAllQuarantines: async (req: Request, res: Response) => {
        try {
            const quarantines = await QuarantineList.findAll({
                include: [
                    { model: Order, as: 'order' },
                    { model: Material, as: 'material' },
                    { model: AuditStatus, as: 'status' },
                    { model: User, as: 'auditor_user', attributes: ['id', 'name'] },
                    { model: User, as: 'inspector_user', attributes: ['id', 'name'] }
                ],
                order: [['due_date', 'ASC']]
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: quarantines
            });
        } catch (error) {
            console.error('Error getting quarantine records:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    // Get quarantine by ID
    getQuarantineById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const quarantine = await QuarantineList.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                    { model: Material, as: 'material' },
                    { model: AuditStatus, as: 'status' },
                    { model: User, as: 'auditor_user', attributes: ['id', 'name'] },
                    { model: User, as: 'inspector_user', attributes: ['id', 'name'] },
                    {
                        model: OrderDetailInspectionResult,
                        as: 'inspectionResults',
                        attributes: ['id', 'inspectionTopicId', 'result'],
                        include: [{
                            model: InspectionTopic,
                            as: 'inspectionTopic',
                            attributes: ['id', 'inspect_id', 'inspect_name', 'topics', 'method', 'specification']
                        }]
                    }
                ]
            });

            if (!quarantine) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Quarantine record not found"
                });
            }

            return res.json({
                code: 0,
                message: msg["0"],
                data: quarantine
            });
        } catch (error) {
            console.error('Error getting quarantine record:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    // getQuarantineById: async (req: Request, res: Response) => {
    //     try {
    //         const { id } = req.params;

    //         const quarantine = await QuarantineList.findByPk(id, {
    //             include: [
    //                 { model: Order, as: 'order' },
    //                 { model: Material, as: 'material' },
    //                 { model: AuditStatus, as: 'status' },
    //                 { model: User, as: 'auditor_user', attributes: ['id', 'name'] },
    //                 { model: User, as: 'inspector_user', attributes: ['id', 'name'] }
    //             ]
    //         });

    //         if (!quarantine) {
    //             return res.json({
    //                 code: 101,
    //                 message: msg["101"],
    //                 detail: "Quarantine record not found"
    //             });
    //         }

    //         return res.json({
    //             code: 0,
    //             message: msg["0"],
    //             data: quarantine
    //         });
    //     } catch (error) {
    //         console.error('Error getting quarantine record:', error);
    //         return res.status(500).json({
    //             code: 500,
    //             message: msg["500"],
    //             detail: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // },

    // Update quarantine record
    updateQuarantine: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                order_id,
                material_id,
                amount,
                unit,
                due_date,
                audit_status,
                auditor,
                inspector,
                admit_date,
                audit_result
            } = req.body;

            // 1. Find the quarantine record
            const quarantine = await QuarantineList.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                    // { model: OrderDetail, as: 'order_detail' }
                ],
                transaction
            });

            if (!quarantine) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Quarantine record not found"
                });
            }


            // 2. Check if order exists
            const order = await Order.findByPk(order_id, { transaction });
            if (!order) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Order not found"
                });
            }

            // 2. Validate amount against original order if amount is being updated
            if (amount !== undefined) {
                if (amount <= 0) {
                    await transaction.rollback();
                    return res.json({
                        code: 108,
                        message: "Invalid amount",
                        detail: "Amount must be greater than 0"
                    });
                }

                // Get the original order detail
                const orderDetail = await OrderDetail.findOne({
                    where: {
                        order_id: order_id,
                        material_id: material_id
                    },
                    transaction
                });

                console.log("Order detail: ", orderDetail)

                if (!orderDetail) {
                    await transaction.rollback();
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: "Material not found in this order"
                    });
                }

                if (!isValidMaterialUnit(unit)) return res.json({
                    code: 111,
                    message: msg["111"],
                    detail: `ProductUnit ${unit} is not in [${Object.values(MaterialUnit)}]`
                });

            }

            // 3. Validate auditor/inspector exists if provided
            if (auditor !== undefined) {
                if (auditor === null) {
                    // Clear auditor
                } else {
                    const auditorUser = await User.findByPk(auditor, { transaction });
                    if (!auditorUser) {
                        await transaction.rollback();
                        return res.json({
                            code: 101,
                            message: msg["101"],
                            detail: "Auditor user not found"
                        });
                    }
                }
            }

            if (inspector !== undefined) {
                if (inspector === null) {
                    // Clear inspector
                } else {
                    const inspectorUser = await User.findByPk(inspector, { transaction });
                    if (!inspectorUser) {
                        await transaction.rollback();
                        return res.json({
                            code: 101,
                            message: msg["101"],
                            detail: "Inspector user not found"
                        });
                    }
                }
            }

            // 4. Validate audit status exists if provided
            if (audit_status !== undefined) {
                const status = await AuditStatus.findByPk(audit_status, { transaction });
                if (!status) {
                    await transaction.rollback();
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: "Audit status not found"
                    });
                }
            }

            // 5. Prepare update data
            const updateData: any = {
                ...(amount !== undefined && { amount }),
                ...(unit !== undefined && { unit }),
                ...(due_date !== undefined && { due_date }),
                ...(audit_status !== undefined && { audit_status }),
                ...(admit_date !== undefined && { admit_date }),
                ...(audit_result !== undefined && { audit_result }),
                ...(auditor !== undefined && { auditor }), // Can be null to clear
                ...(inspector !== undefined && { inspector }) // Can be null to clear
            };

            // 6. Update the record
            await quarantine.update(updateData, { transaction });

            await transaction.commit();

            // 7. Return the updated record with relationships
            const updatedQuarantine = await QuarantineList.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                    { model: Material, as: 'material' },
                    { model: AuditStatus, as: 'status' },
                    {
                        model: User,
                        as: 'auditor_user',
                        attributes: ['id', 'name'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'inspector_user',
                        attributes: ['id', 'name'],
                        required: false
                    }
                ]
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: updatedQuarantine
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error updating quarantine record:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },


    deleteQuarantine: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;

            // 1. Validate ID is a number
            if (isNaN(Number(id))) {
                await transaction.rollback();
                return res.status(400).json({
                    code: 400,
                    message: "Invalid quarantine ID format"
                });
            }

            // 2. Find the quarantine record
            const quarantine = await QuarantineList.findByPk(id, {
                transaction,
                include: [
                    {
                        model: AuditStatus,
                        as: 'status',
                        attributes: ['status_code']
                    }
                ]
            });

            if (!quarantine) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Quarantine record not found"
                });
            }

            // // 3. Check if quarantine can be deleted (optional business rule)
            // if (quarantine.status && quarantine.status.status_code === 'APPROVED') {
            //     await transaction.rollback();
            //     return res.json({
            //         code: 110,
            //         message: "Cannot delete approved quarantine records",
            //         detail: `Current status: ${quarantine.status.status_code}`
            //     });
            // }

            // // 4. Create audit log before deletion (optional)
            // await AuditLog.create({
            //     action: 'QUARANTINE_DELETED',
            //     userId: req.user.id,
            //     recordId: quarantine.id,
            //     changes: JSON.stringify(quarantine.toJSON())
            // }, { transaction });

            // 5. Delete the record
            await quarantine.destroy({ transaction });
            await transaction.commit();

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    id: quarantine.id,
                    qt_id: quarantine.qt_id,
                    deleted: true
                }
            });

        } catch (error) {
            await transaction.rollback();

            console.error('Error getting quarantine record:', error);
            return res.status(500).json({
                code: 110,
                message: msg["110"],
            });
        }

    }
};