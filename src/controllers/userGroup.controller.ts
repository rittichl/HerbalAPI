import { Request, Response } from 'express';
import UserGroup from '../models/user_group.model';
import msg from '../constants/msg.json'


export const getAllUserGroups = async (req: Request, res: Response) => {
    console.log("Fetching getAllUserGroups...");
    try {
        const users = await UserGroup.findAll({ order: [['id', 'ASC']] });
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching users' });
    }
};

export const updateUserGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const userGroup = await UserGroup.findByPk(id);
        if (!userGroup) {
            return res.status(200).json({
                code: 101,
                message: msg["101"],
                detail: `group_code ${updates.group_code}`,
            });
        }

        const existingGroup = await UserGroup.findOne({ where: { group_code: updates.group_code } });
        console.log(existingGroup)
        if (existingGroup && existingGroup.id != Number(id)) {
            return res.status(200).json({
                code: 107,
                message: msg["107"],
                detail: `group_code ${userGroup.group_code}`
            });
        }

        await userGroup.update(updates);
        return res.json({ code: 0, message: msg["0"], data: userGroup.get() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: msg["500"] });
    }
};



export const createUserGroup = async (req: Request, res: Response) => {

    try {
        const { group_code, group_name } = req.body;

        // 1. Check if group code already exists
        const existingGroup = await UserGroup.findOne({
            where: { group_code }
        });

        if (existingGroup) {
            return res.status(409).json({
                success: false,
                message: 'Group code already exists'
            });
        }

        // 2. Create new user group
        const newUserGroup = await UserGroup.create({
            group_code,
            group_name
        });

        // 5. Return success response
        return res.status(201).json({
            success: true,
            data: {
                id: newUserGroup.id,
                group_code: newUserGroup.group_code,
                group_name: newUserGroup.group_name,
                created_at: newUserGroup.created_at
            }
        });

    } catch (error) {
        console.error('Error creating user group:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
        });
    }
};

export default {
    getAllUserGroups,
    updateUserGroup,
    createUserGroup
};