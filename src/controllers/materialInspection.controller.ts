import { Request, Response } from 'express';
import MaterialInspection from '../models/materialInspection.model';
import { Material } from '../models/material.model';
import InspectionTopic from '../models/inspectionTopic.model';
import msg from '../constants/msg.json';

export const materialInspectionController = {

    // Helper to generate next inspect_id (MDxxxx)
    generateNextInspectId: async (): Promise<string> => {
        const lastTopic = await InspectionTopic.findOne({
            order: [['inspect_id', 'DESC']],
            attributes: ['inspect_id']
        });

        let nextNumber = 1;
        if (lastTopic && lastTopic.inspect_id) {
            const lastNum = parseInt(lastTopic.inspect_id.replace('MD', ''), 10);
            nextNumber = lastNum + 1;
        }
        return `MD${String(nextNumber).padStart(4, '0')}`;
    },

    // Create a new material-inspection topic link
    createMaterialInspection: async (req: Request, res: Response) => {
        try {
            const { material_id, inspection_topic_id } = req.body;

            // 1. Validate if material_id exists
            const material = await Material.findByPk(material_id);
            if (!material) {
                return res.json({
                    code: 101, // Assuming code 101 for not found
                    message: msg["101"],
                    detail: `Material with ID ${material_id} not found.`
                });
            }

            // 2. Validate if inspection_topic_id exists
            const inspectionTopic = await InspectionTopic.findByPk(inspection_topic_id);
            if (!inspectionTopic) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Inspection Topic with ID ${inspection_topic_id} not found.`
                });
            }

            // 3. Check if the link already exists to prevent duplicates
            const existingLink = await MaterialInspection.findOne({
                where: {
                    materialId: material_id,
                    inspectionTopicId: inspection_topic_id
                }
            });

            if (existingLink) {
                return res.json({
                    code: 107, // Assuming code 107 for already exists
                    message: msg["107"],
                    detail: `Link between Material ID ${material_id} and Inspection Topic ID ${inspection_topic_id} already exists.`
                });
            }

            // 4. Create the new link
            const newLink = await MaterialInspection.create({
                materialId: material_id,
                inspectionTopicId: inspection_topic_id
            });

            return res.json({ code: 0, message: msg["0"], data: newLink.get() });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all material-inspection topic links, grouped by material
    getAllMaterialInspections: async (req: Request, res: Response) => {
        try {
            const materialsWithTopics = await Material.findAll({
                include: [
                    {
                        model: InspectionTopic,
                        as: 'inspectionTopics', // This 'as' must match the alias in db.ts association
                        attributes: ['id', 'inspect_id', 'inspect_name', 'topics', 'method', 'specification'],
                        through: { // Include attributes from the junction table if needed
                            attributes: [] // Don't include junction table columns directly in the result
                        }
                    }
                ],
                attributes: ['id', 'materialId', 'materialNameTh', 'materialNameEn', 'barcode'], // Select material attributes
                order: [['materialId', 'ASC']]
            });

            // If you want to explicitly format the output to ensure an empty array
            // for materials with no topics, you can map over the results.
            const formattedResults = materialsWithTopics.map(material => ({
                id: material.id,
                materialId: material.materialId,
                materialNameTh: material.materialNameTh,
                materialNameEn: material.materialNameEn,
                barcode: material.barcode,
                inspectionTopics: material.inspectionTopics || [] // Ensure it's an array even if no topics
            }));

            return res.json({ code: 0, message: msg["0"], data: formattedResults });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all inspection topics for a specific material
    getMaterialInspectionsByMaterialId: async (req: Request, res: Response) => {
        try {
            const { materialId } = req.params;

            // This endpoint can now leverage the direct association on Material
            const material = await Material.findByPk(materialId, {
                include: [{
                    model: InspectionTopic,
                    as: 'inspectionTopics',
                    attributes: ['id', 'inspect_id', 'inspect_name', 'topics', 'method', 'specification'],
                    through: {
                        attributes: []
                    }
                }],
                attributes: ['id', 'materialId', 'materialNameTh', 'materialNameEn']
            });

            if (!material) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Material with ID ${materialId} not found.`
                });
            }

            // Return the material object with its associated inspection topics
            return res.json({ code: 0, message: msg["0"], data: material });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all materials for a specific inspection topic
    getMaterialInspectionsByTopicId: async (req: Request, res: Response) => {
        try {
            const { inspectionTopicId } = req.params;

            // This endpoint can now leverage the direct association on InspectionTopic
            const inspectionTopic = await InspectionTopic.findByPk(inspectionTopicId, {
                include: [{
                    model: Material,
                    as: 'materials', // This 'as' must match the alias in db.ts association
                    attributes: ['id', 'materialId', 'materialNameTh', 'materialNameEn', 'barcode'],
                    through: {
                        attributes: []
                    }
                }],
                attributes: ['id', 'inspect_id', 'inspect_name', 'topics', 'method', 'specification']
            });

            if (!inspectionTopic) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Inspection Topic with ID ${inspectionTopicId} not found.`
                });
            }

            // Return the inspection topic object with its associated materials
            return res.json({ code: 0, message: msg["0"], data: inspectionTopic });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },


    // Delete a specific material-inspection topic link by its primary key (id in MaterialInspection)
    // deleteMaterialInspection: async (req: Request, res: Response) => {
    //     try {
    //         const { id } = req.params;

    //         const link = await MaterialInspection.findByPk(id);
    //         if (!link) {
    //             return res.json({
    //                 code: 101,
    //                 message: msg["101"],
    //                 detail: `Material-Inspection link with ID ${id} not found.`
    //             });
    //         }

    //         await link.destroy();
    //         return res.json({ code: 0, message: msg["0"], detail: `Link with ID ${id} deleted successfully.` });
    //     } catch (error) {
    //         return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
    //     }
    // },

    // You can also add a delete by material_id and inspection_topic_id if needed
    deleteMaterialInspectionByPair: async (req: Request, res: Response) => {
        try {
            const { material_id, inspection_topic_id } = req.body; // Or req.query if it's a GET for deletion

            const link = await MaterialInspection.findOne({
                where: {
                    materialId: material_id,
                    inspectionTopicId: inspection_topic_id
                }
            });

            if (!link) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: `Link between Material ID ${material_id} and Inspection Topic ID ${inspection_topic_id} not found.`
                });
            }

            await link.destroy();
            return res.json({ code: 0, message: msg["0"], detail: `Link between Material ID ${material_id} and Inspection Topic ID ${inspection_topic_id} deleted successfully.` });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};
