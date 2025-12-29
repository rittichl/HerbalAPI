import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import Order from '../models/order.model';
import OrderDetail from '../models/orderDetail.model';
import msg from '../constants/msg.json';
import Vendor from '../models/vendor.model';
import { Material } from '../models/material.model';
import sequelize from '../config/database';
import PaymentType from '../models/paymentType.model';
import { isValidMaterialUnit } from '../utility/util.function';
import { MaterialUnit } from '../constants/enum.data';


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


export const orderController = {
    // Generate PO number
    generatePONumber: async (year: number, month: string, day: string): Promise<string> => {
        const lastOrder = await Order.findOne({
            where: {
                order_id: {
                    [Op.like]: `PO-${year}${month}${day}-%`
                }
            },
            order: [['order_id', 'DESC']],
        });

        const lastNumber = lastOrder ?
            parseInt(lastOrder.order_id.split('-')[2]) : 0;
        const newNumber = (lastNumber + 1).toString().padStart(4, '0');

        return `PO-${year}${month}${day}-${newNumber}`;
    },



    // Create new order
    // Create new order
    createOrder: async (req: Request, res: Response) => {
        try {
            const { vendor_id, payment_id, delivery_days, items, order_date } = req.body;

            if (!isValidDate(order_date) || !isNotOlderThanToday(order_date)) {
                return res.json({ code: 111, message: msg["111"], detail: `order_date wrong date data` });
            }

            const date = new Date(order_date);
            const month = date.getMonth() + 1;
            const formattedMonth = month.toString().padStart(2, '0');
            const day = date.getDate();
            const formattedDay = day.toString().padStart(2, '0');
            const year = date.getFullYear();  // This will return 2025

            // Check Existing Vendor
            const vendor = await Vendor.findByPk(vendor_id);

            if (!vendor) {
                return res.json({ code: 101, message: msg["101"], detail: `vendor_id ${vendor_id}` });
            }

            // Generate PO number
            const order_id = await orderController.generatePONumber(year, formattedMonth, formattedDay);

            // Create order
            const order = await Order.create({
                order_id,
                order_date: new Date(),
                vendor_id,
                payment_id,
                delivery_days
            });

            const details = await Promise.all(
                items.map(async (item: any) => {
                    // const material = await Material.findOne({ where: { materialId: item.material_id.toString() } });
                    const material = await Material.findOne({ where: { id: item.material_id } });

                    if (!material) {
                        return res.json({ code: 101, message: msg["101"], detail: `material_id ${item.material_id}` });
                    }

                    // Create order detail and include material_id
                    const orderDetail = await OrderDetail.create({
                        order_id: order.id,
                        material_id: material.id,  // Linking to the actual 'id' from Material table
                        amount: item.amount,
                        price: item.price,
                        order_unit: item.order_unit
                    });

                    // Returning order detail with material_id included
                    return {
                        ...orderDetail.get(),  // get the plain data of orderDetail
                        materialId: material.materialId  // Explicitly adding the material_id here
                    };
                })
            );

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    order: order.get(),
                    details
                }
            });

        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get all orders
    getAllOrders: async (req: Request, res: Response) => {
        try {
            const orders = await Order.findAll({
                include: [
                    {
                        model: Vendor,
                        as: 'vendor',
                        attributes: ['vendor_name_th', 'vendor_name_en']
                    },
                    {
                        model: PaymentType,
                        as: 'payment_type',
                        attributes: ['id', 'payment_type_th', 'payment_type_en']
                    },
                    {
                        model: OrderDetail,
                        as: 'details',
                        include: [{
                            model: Material,
                            as: 'material',
                            attributes: ['materialNameEn', 'materialNameTh']
                        }

                        ]
                    }
                ],
                order: [['order_date', 'DESC']]
            });

            return res.json({ code: 0, message: msg["0"], data: orders });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    addMaterialToOrder: async (req: Request, res: Response) => {
        try {
            const { order_id, material_id, amount, price, order_unit } = req.body;

            if (!isValidMaterialUnit(order_unit)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `order_unit ${order_unit} is not in [${Object.values(MaterialUnit)}]`
            });

            // Check if order exists
            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.json({ code: 101, message: msg["101"], detail: "Order not found" });
            }

            // Check if material exists
            const material = await Material.findByPk(material_id);
            if (!material) {
                return res.json({ code: 101, message: msg["101"], detail: "Material not found" });
            }

            // Create order detail
            const orderDetail = await OrderDetail.create({
                order_id,
                material_id,
                amount,
                price: price,
                order_unit: order_unit
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    ...orderDetail.get(),  // Get the plain data of orderDetail
                    materialId: material.materialId  // Adding materialId from Material model
                }
            });


            // return res.json({
            //     code: 0,
            //     message: msg["0"],
            //     data: orderDetail
            // });

        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    getOrderById: async (req: Request, res: Response) => {
        try {
            const { order_id } = req.params;

            const [order, total] = await Promise.all([
                Order.findOne({
                    where: { id: order_id },
                    include: [
                        { model: Vendor, as: 'vendor' },
                        {
                            model: PaymentType,
                            as: 'payment_type',
                            attributes: ['id', 'payment_type_th', 'payment_type_en']
                        },
                        {
                            model: OrderDetail,
                            as: 'details',
                            include: [{
                                model: Material,
                                as: 'material'
                            }
                            ]
                        }
                    ]
                }),
                OrderDetail.sum('amount', { where: { order_id } })
            ]);

            if (!order) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    ...order.get({ plain: true }),
                    total_amount: total || 0
                }
            });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"] });
        }
    },

    // Add this method to your orderController
    removeMaterialFromOrder: async (req: Request, res: Response) => {
        try {
            // const { order_id, material_id } = req.params;
            const { order_id, material_id } = req.body;


            // // Validate parameters
            // if (!order_id || !material_id) {
            //     return res.status(400).json({
            //         code: 400,
            //         message: "Order ID and Material ID are required"
            //     });
            // }

            // Check if order exists
            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Order not found"
                });
            }

            // Find and delete the order detail
            const deletedCount = await OrderDetail.destroy({
                where: {
                    order_id,
                    material_id
                }
            });

            if (deletedCount === 0) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Material not found in this order"
                });
            }

            return res.json({
                code: 0,
                message: msg["0"],
                // data: {
                //     order_id,
                //     material_id,
                //     removed: true
                // }
            });

        } catch (error) {
            console.error('Error removing material from order:', error);
            return res.status(500).json({ code: 500, message: msg["500"] });

        }
    },

    // Add this method to your orderController
    // deleteOrder: async (req: Request, res: Response) => {
    //     try {
    //         const { order_id } = req.params;

    //         // Option 1: Using raw query to force cascade delete
    //         await sequelize.query(
    //             `DELETE FROM "mis_order" WHERE "order_id" = :order_id`,
    //             {
    //                 replacements: { order_id },
    //                 type: QueryTypes.DELETE
    //             }
    //         );

    //         return res.json({
    //             code: 0,
    //             message: msg["0"],
    //             data: { order_id, deleted: true }
    //         });

    //     } catch (error) {
    //         console.error('Error deleting order:', error);
    //         return res.status(500).json({
    //             code: 500,
    //             message: msg["500"],
    //             detail: error
    //         });
    //     }
    // }
    deleteOrder: async (req: Request, res: Response) => {
        try {
            const { order_id } = req.params;

            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await OrderDetail.destroy({ where: { order_id }, force: true });

            await order.destroy();
            return res.json({ code: 0, message: msg["0"] });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }

    },

    updateOrderMaterial: async (req: Request, res: Response) => {
        try {
            const { order_id, material_id, amount, price } = req.body;


            // Find the order detail
            const orderDetail = await OrderDetail.findOne({
                where: {
                    order_id,
                    material_id
                }
            });

            if (!orderDetail) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Material not found in this order"
                });
            }

            // Prepare update data
            const updateData: any = {};
            if (amount !== undefined) updateData.amount = amount;
            if (price !== undefined) updateData.price = price;

            // Update the order detail
            await orderDetail.update(updateData);

            return res.json({
                code: 0,
                message: msg["0"],
                data: orderDetail
            });

        } catch (error) {
            console.error('Error updating order material:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error
            });
        }
    },


    updateOrderMaterials: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();
        try {
            const { order_id, vendor_id, payment_id, delivery_days, items } = req.body;

            // Validate required fields
            if (!Array.isArray(items)) {
                await transaction.rollback();
                return res.status(400).json({
                    code: 400,
                    message: "Order ID and items array are required"
                });
            }

            // Check if order exists
            const order = await Order.findByPk(order_id, { transaction });
            if (!order) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Order not found"
                });
            }

            const vendor = await Vendor.findByPk(vendor_id, { transaction })
            if (!vendor) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Vendor not found"
                });
            }

            // Update order fields if provided
            const orderUpdateData: any = {};
            if (payment_id !== undefined) orderUpdateData.payment_id = payment_id;
            if (vendor_id != undefined) orderUpdateData.vendor_id = vendor_id;
            if (delivery_days !== undefined) {
                if (delivery_days < 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        code: 400,
                        message: "Delivery days cannot be negative"
                    });
                }
                orderUpdateData.delivery_days = delivery_days;
            }

            if (Object.keys(orderUpdateData).length > 0) {
                await order.update(orderUpdateData, { transaction });
            }

            // Process each material update
            const results = [];
            for (const item of items) {
                const { material_id, amount, price, order_unit } = item;

                // Validate item fields
                if (!material_id || amount === undefined || price === undefined || order_unit == undefined) {
                    await transaction.rollback();
                    return res.status(400).json({
                        code: 400,
                        message: "Each item must include material_id, amount, price, and order_unit"
                    });
                }

                if (!isValidMaterialUnit(order_unit)) return res.json({
                    code: 111,
                    message: msg["111"],
                    detail: `order_unit ${order_unit} is not in [${Object.values(MaterialUnit)}]`
                });

                // Find the order detail
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
                        detail: `Material ${material_id} not found in this order`
                    });
                }

                // Validate values
                if (amount <= 0 || price < 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        code: 400,
                        message: "Amount must be positive and price cannot be negative"
                    });
                }

                // Update the order detail
                await orderDetail.update({ amount, price }, { transaction });
                results.push(orderDetail);
            }

            await transaction.commit();

            // Return the updated order with details
            const updatedOrder = await Order.findByPk(order_id, {
                include: [
                    {
                        model: OrderDetail,
                        as: 'details',
                        include: [{
                            model: Material,
                            as: 'material'
                        }],
                        // order: [['material_id', 'DESC']]
                    },
                    {
                        model: PaymentType,
                        as: 'payment_type'
                    }
                ],
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: updatedOrder
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error updating order materials:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error,
            });
        }
    },


    // Add this method to your orderController
    updateOrderVendor: async (req: Request, res: Response) => {
        try {
            const { order_id, vendor_id, payment_id, delivery_days } = req.body;


            // Check if order exists
            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Order not found"
                });
            }

            // Check if new vendor exists
            const vendor = await Vendor.findByPk(vendor_id);
            if (!vendor) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Vendor not found"
                });
            }

            // Check if order can be modified (optional)
            if (order.status === 'COMPLETED') {
                return res.json({
                    code: 110,
                    message: "Cannot modify completed orders"
                });
            }

            // Update vendor
            await order.update({ vendor_id, payment_id, delivery_days });

            return res.json({
                code: 0,
                message: msg["0"],
                // data: {
                //     order_id,
                //     previous_vendor_id: order.previous('vendor_id'),
                //     new_vendor_id: vendor_id
                // }
            });

        } catch (error) {
            console.error('Error updating order vendor:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error
            });
        }
    }
};