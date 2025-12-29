import { Request, Response } from 'express';
import Vendor from '../models/vendor.model';
import msg from '../constants/msg.json';

export const vendorController = {
    // Create a new vendor
    createVendor: async (req: Request, res: Response) => {
        try {
            const { vendor_name_th, vendor_name_en, mobile_number, address, email, contact } = req.body;

            // Create new vendor (ID will be auto-generated)
            const vendor = await Vendor.create({
                vendor_name_th,
                vendor_name_en,
                mobile_number,
                address,
                email,
                contact
            });

            return res.json({ code: 0, message: msg["0"], data: vendor });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all vendors
    getAllVendors: async (req: Request, res: Response) => {
        try {
            const vendors = await Vendor.findAll({
                attributes: ['id', 'vendor_name_th', 'vendor_name_en', 'mobile_number', 'address', 'email', 'contact', 'createdAt'],
                order: [['vendor_name_en', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: vendors });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single vendor by ID
    getVendorById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const vendor = await Vendor.findByPk(id, {
                attributes: ['id', 'vendor_name_th', 'vendor_name_en', 'mobile_number', 'address', 'email', 'contact', 'createdAt', 'updatedAt']
            });

            if (!vendor) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: vendor });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update vendor
    updateVendor: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { vendor_name_th, vendor_name_en, mobile_number, address, email, contact } = req.body;

            const vendor = await Vendor.findByPk(id);
            if (!vendor) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await vendor.update({ vendor_name_th, vendor_name_en, mobile_number, address, email, contact });
            return res.json({ code: 0, message: msg["0"], data: vendor });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete vendor
    deleteVendor: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const vendor = await Vendor.findByPk(id);
            if (!vendor) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await vendor.destroy();
            return res.json({ code: 0, message: msg["0"] });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },



};