import { Request, Response } from 'express';
// import { MaterialType, MaterialUnit } from '../models/material.model';
import { MaterialType, MaterialUnit, UserRole } from '../constants/enum.data';
import msg from '../constants/msg.json';



export const dataTypeController = {
    // Get all Material Type
    getMaterialType: async (req: Request, res: Response) => {
        try {
            return res.json({ code: 0, message: msg["0"], data: MaterialType });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    getMaterialkUnit: async (req: Request, res: Response) => {
        try {
            return res.json({ code: 0, message: msg["0"], data: MaterialUnit });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    getUserRole: async (req: Request, res: Response) => {
        try {
            return res.json({ code: 0, message: msg["0"], data: UserRole });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },
};