import { Request, Response } from 'express';
import PaymentType from '../models/paymentType.model';
import msg from '../constants/msg.json';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

export const paymentTypeController = {
    // Create new payment type
    createPaymentType: async (req: Request, res: Response) => {
        try {
            const { payment_type_th, payment_type_en } = req.body;


            // Check for existing payment types (case-insensitive)
            const existingTH = await PaymentType.findOne({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('payment_type_th')),
                    sequelize.fn('LOWER', payment_type_th)
                )
            });

            const existingEN = await PaymentType.findOne({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('payment_type_en')),
                    sequelize.fn('LOWER', payment_type_en)
                )
            });

            if (existingTH) {
                return res.json({
                    code: 107,
                    message: msg["107"],
                    detail: "Thai payment type already exists"
                });
            }

            if (existingEN) {
                return res.json({
                    code: 107,
                    message: msg["107"],
                    detail: "English payment type already exists"
                });
            }

            // Create new payment type
            const paymentType = await PaymentType.create({
                payment_type_th,
                payment_type_en
            }, {
                returning: true // Ensure we get the created record
            });

            return res.status(201).json({
                code: 0,
                message: msg["0"],
                data: paymentType
            });

        } catch (error) {
            console.error('Error creating payment type:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error
            });
        }
    },

    // createPaymentType: async (req: Request, res: Response) => {
    //     try {
    //         const { payment_type_th, payment_type_en } = req.body;

    //         const paymentType = await PaymentType.create({
    //             payment_type_th,
    //             payment_type_en,
    //         });

    //         return res.json({
    //             code: 0,
    //             message: msg["0"],
    //             data: paymentType,
    //         });
    //     } catch (error) {
    //         return res.status(500).json({
    //             code: 500,
    //             message: msg["500"],
    //             detail: `${error}`,
    //         });
    //     }
    // },

    // Get all payment types
    getAllPaymentTypes: async (req: Request, res: Response) => {
        try {
            const paymentTypes = await PaymentType.findAll({
                attributes: ['id', 'payment_type_th', 'payment_type_en'],
                order: [['payment_type_en', 'ASC']],
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: paymentTypes,
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`,
            });
        }
    },


    getPaymentTypeById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            console.log(id)

            const payment = await PaymentType.findByPk(id, {
                attributes: ['id', 'payment_type_th', 'payment_type_en']
            });

            if (!payment) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: payment });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update payment type
    updatePaymentType: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { payment_type_th, payment_type_en } = req.body;

            // 1. Find the payment type to update
            const paymentType = await PaymentType.findByPk(id);
            if (!paymentType) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: "Payment type not found"
                });
            }

            // 2. Check if new names already exist (excluding current record)
            if (payment_type_th) {
                const existingTH = await PaymentType.findOne({
                    where: {
                        payment_type_th,
                        id: { [Op.ne]: id } // Not equal to current ID
                    }
                });

                console.log("existingTH: ", existingTH)
                if (existingTH) {
                    return res.json({
                        code: 107,
                        message: msg["107"],
                        detail: "Thai payment type already exists"
                    });
                }
            }

            if (payment_type_en) {
                const existingEN = await PaymentType.findOne({
                    where: {
                        payment_type_en,
                        id: { [Op.ne]: id }
                    }
                });
                if (existingEN) {
                    return res.json({
                        code: 107,
                        message: msg["107"],
                        detail: "English payment type already exists"
                    });
                }
            }

            // 3. Prepare update data (only update provided fields)
            const updateData: any = {};
            if (payment_type_th !== undefined) updateData.payment_type_th = payment_type_th;
            if (payment_type_en !== undefined) updateData.payment_type_en = payment_type_en;

            // 4. Update the record
            await paymentType.update(updateData);

            return res.json({
                code: 0,
                message: msg["0"],
                data: await PaymentType.findByPk(id) // Return fresh data
            });

        } catch (error) {
            console.error('Error updating payment type:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error
            });
        }
    },
    // updatePaymentType: async (req: Request, res: Response) => {
    //     try {
    //         const { id } = req.params;
    //         const { payment_type_th, payment_type_en } = req.body;

    //         const paymentType = await PaymentType.findByPk(id);
    //         if (!paymentType) {
    //             return res.json({
    //                 code: 101,
    //                 message: msg["101"],
    //             });
    //         }

    //         await paymentType.update({
    //             payment_type_th,
    //             payment_type_en,
    //         });

    //         return res.json({
    //             code: 0,
    //             message: msg["0"],
    //             data: paymentType,
    //         });
    //     } catch (error) {
    //         console.log("Error: ", error)
    //         return res.status(500).json({
    //             code: 500,
    //             message: msg["500"],
    //             detail: `${error}`,
    //         });
    //     }
    // },

    // Delete payment type
    deletePaymentType: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const paymentType = await PaymentType.findByPk(id);
            if (!paymentType) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                });
            }

            await paymentType.destroy();

            return res.json({
                code: 0,
                message: msg["0"],
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`,
            });
        }
    },
};