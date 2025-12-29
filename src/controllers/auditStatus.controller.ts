import { Request, Response } from 'express';
import AuditStatus from '../models/auditStatus.model';
import msg from '../constants/msg.json';
import { isUniqueConstraintError, isForeignKeyConstraintError } from '../utility/errorUtils'


export const auditStatusController = {
    // Create new audit status
    createStatus: async (req: Request, res: Response) => {
        try {
            const { status_code, status_name } = req.body;

            const status = await AuditStatus.create({
                status_code,
                status_name
            });

            return res.status(201).json({
                code: 0,
                message: msg["0"],
                data: status
            });
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                return res.json({
                    code: 107,
                    message: msg["107"],
                    detail: "Status code must be unique"
                });
            }

            console.error('Error creating audit status:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    // Get all statuses
    getAllStatuses: async (req: Request, res: Response) => {
        try {
            const statuses = await AuditStatus.findAll({
                attributes: ['id', 'status_code', 'status_name'],
                order: [['id', 'ASC']]
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: statuses
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },


    // Add this to your auditStatusController
    getStatusById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate ID is a number
            if (isNaN(Number(id))) {
                return res.status(400).json({
                    code: 400,
                    message: "ID must be a number"
                });
            }

            const status = await AuditStatus.findByPk(id, {
                attributes: ['id', 'status_code', 'status_name', 'createdAt', 'updatedAt']
            });

            if (!status) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Status with ID ${id} not found`
                });
            }

            return res.json({
                code: 0,
                message: msg["0"],
                data: status
            });

        } catch (error) {
            console.error(`Error getting status by ID: ${error}`);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    // Update status
    updateStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            var { status_code, status_name } = req.body;

            const status = await AuditStatus.findByPk(id);
            if (!status) {
                return res.json({
                    code: 101,
                    message: msg["101"]
                });
            }
            status_code = status_code.toString();

            // Check if status_code is being changed to a duplicate
            if (status_code && status_code !== status.status_code) {
                const existing = await AuditStatus.findOne({ where: { status_code } });
                if (existing) {
                    return res.json({
                        code: 107,
                        message: msg["107"],
                        detail: "Status code must be unique"
                    });
                }
            }

            await status.update({
                status_code: status_code || status.status_code,
                status_name: status_name || status.status_name
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: status
            });
        } catch (error) {
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Delete status
    deleteStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const status = await AuditStatus.findByPk(id);

            if (!status) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await status.destroy();
            return res.json({ code: 0, message: msg["0"] });

        } catch (error) {
            if (isForeignKeyConstraintError(error)) {
                return res.json({
                    code: 110,
                    message: "Cannot delete status with associated records"
                });
            }

            console.error('Error deleting audit status:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};