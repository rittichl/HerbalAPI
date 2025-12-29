import { Request, Response } from 'express';
import OrderDetailInspectionResult from '../models/orderDetailInspectionResult.model';
import InspectionTopic from '../models/inspectionTopic.model';
import QuarantineList from '../models/quarantineList.model'; // Import QuarantineList model
import msg from '../constants/msg.json';
import db from '../models/db';
import OrderDetail from '../models/orderDetail.model';
import { Material } from '../models/material.model';
import AuditStatus from '../models/auditStatus.model';
import User from '../models/user.model';
import Order from '../models/order.model';
import { Op } from 'sequelize';
import sequelize from '../config/database'; // Import sequelize for transactions




export const orderDetailInspectionResultController = {

    // Create a new inspection result for a quarantine list entry and topic
    createResult: async (req: Request, res: Response) => {
        try {
            const { quarantine_list_id, inspection_topic_id, result } = req.body; // Changed from inspection_batch_id

            // 1. Validate if QuarantineList entry exists
            const quarantineList = await QuarantineList.findByPk(quarantine_list_id);
            if (!quarantineList) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Quarantine List entry with ID ${quarantine_list_id} not found.`
                });
            }

            // 2. Validate if InspectionTopic exists
            const inspectionTopic = await InspectionTopic.findByPk(inspection_topic_id);
            if (!inspectionTopic) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Inspection Topic with ID ${inspection_topic_id} not found.`
                });
            }

            // 3. Check for existing result to prevent duplicates (unique on quarantine_list_id, inspection_topic_id)
            const existingResult = await OrderDetailInspectionResult.findOne({
                where: {
                    quarantineListId: quarantine_list_id, // Changed
                    inspectionTopicId: inspection_topic_id
                }
            });

            if (existingResult) {
                return res.json({
                    code: 107, // Assuming 107 for already exists
                    message: msg["107"],
                    detail: `Result for Quarantine List ID ${quarantine_list_id} and Inspection Topic ID ${inspection_topic_id} already exists. Consider updating instead.`
                });
            }

            // 4. Create the new result
            const newResult = await OrderDetailInspectionResult.create({
                quarantineListId: quarantine_list_id, // Changed
                inspectionTopicId: inspection_topic_id,
                result: result
            });

            return res.json({ code: 0, message: msg["0"], data: newResult.get() });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all inspection results, optionally filtered
    getAllResults: async (req: Request, res: Response) => {
        try {
            const { orderId, quarantineListId, inspectionTopicId } = req.query; // Added orderId query parameter

            const whereClause: any = {};
            const quarantineWhereClause: any = {};
            const inspectionResultWhereClause: any = {};

            if (orderId) {
                whereClause.id = orderId; // Filter orders by their primary key
            }

            if (quarantineListId) {
                quarantineWhereClause.id = quarantineListId; // Filter quarantine list by its primary key
            }

            if (inspectionTopicId) {
                inspectionResultWhereClause.inspectionTopicId = inspectionTopicId; // Filter results by topic
            }

            const ordersWithInspectionResults = await Order.findAll({
                where: whereClause,
                attributes: ['id', 'order_id', 'order_date'], // Select relevant Order attributes
                include: [
                    {
                        model: OrderDetail,
                        as: 'details', // 'as' should match the association in db.ts (Order.hasMany(OrderDetail, { as: 'details' }))
                        attributes: ['id', 'material_id', 'amount', 'order_unit'],
                        include: [
                            {
                                model: Material,
                                as: 'material', // 'as' should match the association in db.ts (OrderDetail.belongsTo(Material, { as: 'material' }))
                                attributes: ['id', 'materialId', 'materialNameTh', 'materialNameEn']
                            },
                            {
                                model: QuarantineList,
                                as: 'quarantineList', // 'as' should match the association in db.ts (OrderDetail.hasMany(QuarantineList, { as: 'quarantineList' }))
                                where: Object.keys(quarantineWhereClause).length > 0 ? quarantineWhereClause : undefined, // Apply quarantine filters
                                attributes: ['id', 'qt_id', 'admit_date', 'audit_result', 'audit_status', 'auditor', 'inspector', 'createdAt', 'updatedAt'],
                                include: [
                                    {
                                        model: OrderDetailInspectionResult,
                                        as: 'inspectionResults', // 'as' should match the association in db.ts (QuarantineList.hasMany(OrderDetailInspectionResult, { as: 'inspectionResults' }))
                                        where: Object.keys(inspectionResultWhereClause).length > 0 ? inspectionResultWhereClause : undefined, // Apply result topic filters
                                        attributes: ['id', 'result'],
                                        include: [
                                            {
                                                model: InspectionTopic,
                                                as: 'inspectionTopic', // 'as' should match the association in db.ts (OrderDetailInspectionResult.belongsTo(InspectionTopic, { as: 'inspectionTopic' }))
                                                attributes: ['id', 'inspect_id', 'inspect_name', 'topics', 'method', 'specification']
                                            }
                                        ]
                                    },
                                    {
                                        model: User,
                                        as: 'inspector_user',
                                        attributes: ['id', 'name'],
                                        required: false // Use required: false for LEFT JOIN
                                    },
                                    {
                                        model: User,
                                        as: 'auditor_user',
                                        attributes: ['id', 'name'],
                                        required: false // Use required: false for LEFT JOIN
                                    },
                                    {
                                        model: AuditStatus,
                                        as: 'status',
                                        attributes: ['id', 'status_code', 'status_name'],
                                        required: false // Use required: false for LEFT JOIN
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [
                    ['id', 'ASC'], // Order by Order ID
                    [{ model: OrderDetail, as: 'details' }, 'id', 'ASC'], // Then by OrderDetail ID
                    [{ model: OrderDetail, as: 'details' }, { model: QuarantineList, as: 'quarantineList' }, 'id', 'ASC'] // Then by QuarantineList ID
                ]
            });

            // Filter out orders that have no matching inspection results if filters were applied
            const filteredOrders = ordersWithInspectionResults.filter(order => {
                // If no filters are applied, keep all orders.
                if (!orderId && !quarantineListId && !inspectionTopicId) {
                    return true;
                }
                // Check if any included results match the filters
                return order.details?.some((detail: { quarantineList: any[]; }) =>
                    detail.quarantineList?.some(ql =>
                        ql.inspectionResults?.length > 0
                    )
                );
            });


            return res.json({ code: 0, message: msg["0"], data: filteredOrders });
        } catch (error) {
            console.error('Error getting grouped inspection results:', error);
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get a single inspection result by its ID
    getResultById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const result = await OrderDetailInspectionResult.findByPk(id, {
                include: [
                    {
                        model: QuarantineList,
                        as: 'quarantineList',
                        attributes: ['id', 'qt_id', 'admit_date', 'audit_result', 'audit_status', 'auditor', 'inspector', 'createdAt', 'updatedAt'], include: [
                            {
                                model: Order, // Using imported Order model
                                as: 'order',
                                attributes: ['id', 'order_id', 'order_date'] // Include order_date for context
                            },
                            {
                                model: Material, // Using imported Material model
                                as: 'material',
                                attributes: ['id', 'materialId', 'materialNameTh']
                            },
                            {
                                model: User, // Using imported User model
                                as: 'inspector_user',
                                attributes: ['id', 'name']
                            },
                            {
                                model: User, // Using imported User model
                                as: 'auditor_user',
                                attributes: ['id', 'name']
                            },
                            {
                                model: AuditStatus, // Using imported AuditStatus model
                                as: 'status',
                                attributes: ['id', 'status_name']
                            }
                        ]
                    },
                    {
                        model: InspectionTopic,
                        as: 'inspectionTopic',
                        attributes: ['id', 'inspect_id', 'inspect_name', 'topics']
                    }
                ]
            });

            if (!result) {
                return res.json({ code: 101, message: msg["101"], detail: `Inspection result with ID ${id} not found.` });
            }

            return res.json({ code: 0, message: msg["0"], data: result });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update an existing inspection result
    updateResult: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { quarantine_list_id, inspection_topic_id, result } = req.body; // Changed from inspection_batch_id

            const existingResult = await OrderDetailInspectionResult.findByPk(id);
            if (!existingResult) {
                return res.json({ code: 101, message: msg["101"], detail: `Inspection result with ID ${id} not found.` });
            }

            // Optional: If quarantine_list_id or inspection_topic_id are updated, check for new duplicates
            if ((quarantine_list_id && quarantine_list_id !== existingResult.quarantineListId) ||
                (inspection_topic_id && inspection_topic_id !== existingResult.inspectionTopicId)) {

                const duplicateCheck = await OrderDetailInspectionResult.findOne({
                    where: {
                        quarantineListId: quarantine_list_id || existingResult.quarantineListId, // Changed
                        inspectionTopicId: inspection_topic_id || existingResult.inspectionTopicId
                    }
                });

                if (duplicateCheck && duplicateCheck.id !== existingResult.id) {
                    return res.json({
                        code: 107,
                        message: msg["107"],
                        detail: `A result for this Quarantine List entry and Inspection Topic combination already exists.`
                    });
                }
            }

            await existingResult.update({
                quarantineListId: quarantine_list_id || existingResult.quarantineListId, // Changed
                inspectionTopicId: inspection_topic_id || existingResult.inspectionTopicId,
                result: result !== undefined ? result : existingResult.result
            });

            return res.json({ code: 0, message: msg["0"], data: existingResult });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete an inspection result
    deleteResult: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const result = await OrderDetailInspectionResult.findByPk(id);
            if (!result) {
                return res.json({ code: 101, message: msg["101"], detail: `Inspection result with ID ${id} not found.` });
            }

            await result.destroy();
            return res.json({ code: 0, message: msg["0"], detail: `Inspection result with ID ${id} deleted successfully.` });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update multiple inspection results for a specific quarantine list
    updateResultsForQuarantine: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction(); // Start a transaction
        try {
            const { id } = req.params; // quarantine_list_id from URL parameter
            const { results: updates } = req.body; // Array of { inspection_topic_id: number, result: number }

            // 1. Validate if QuarantineList entry exists
            const quarantineList = await QuarantineList.findByPk(id, { transaction });
            if (!quarantineList) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Quarantine List entry with ID ${id} not found.`
                });
            }

            if (!Array.isArray(updates)) {
                await transaction.rollback();
                return res.status(400).json({
                    code: 400,
                    message: "Invalid input",
                    detail: "Body must contain a 'results' array of inspection topic updates."
                });
            }

            const updatedResults = [];
            for (const update of updates) {
                const { inspection_topic_id, result } = update;

                if (typeof inspection_topic_id !== 'number' || (result !== 0 && result !== 1)) {
                    await transaction.rollback();
                    return res.status(400).json({
                        code: 400,
                        message: "Invalid input format",
                        detail: "Each result update must have 'inspection_topic_id' (number) and 'result' (0 or 1)."
                    });
                }

                // Find the specific inspection result for this quarantine list and topic
                const existingResult = await OrderDetailInspectionResult.findOne({
                    where: {
                        quarantineListId: id,
                        inspectionTopicId: inspection_topic_id
                    },
                    transaction
                });

                if (!existingResult) {
                    // This scenario should ideally not happen if createQuarantine pre-populates all topics.
                    // However, if new topics are added later, or logic changes, you might decide to:
                    // A) Create it: (e.g., await OrderDetailInspectionResult.create({ quarantineListId: id, inspectionTopicId, result }, { transaction }))
                    // B) Return an error: (as done below to enforce existing topics only)
                    await transaction.rollback();
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: `No existing inspection result found for Topic ID ${inspection_topic_id} under Quarantine List ID ${id}.`
                    });
                }

                // Update the result
                await existingResult.update({ result }, { transaction });
                updatedResults.push(existingResult.get()); // Get plain data for response
            }

            await transaction.commit(); // Commit the transaction if all updates succeed

            return res.json({
                code: 0,
                message: msg["0"],
                data: updatedResults,
                detail: `Successfully updated ${updatedResults.length} inspection results for Quarantine List ID ${id}.`
            });

        } catch (error) {
            await transaction.rollback(); // Rollback on error
            console.error('Error updating inspection results for quarantine:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
};
