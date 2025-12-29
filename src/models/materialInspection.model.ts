import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { Material } from './material.model'; // Import the Material model
import InspectionTopic from './inspectionTopic.model'; // Import the InspectionTopic model

interface MaterialInspectionAttributes {
    id?: number;
    materialId: number; // Foreign key for Material
    inspectionTopicId: number; // Foreign key for InspectionTopic
    createdAt?: Date;
    updatedAt?: Date;
}

class MaterialInspection extends Model<MaterialInspectionAttributes> implements MaterialInspectionAttributes {
    public id!: number;
    public materialId!: number;
    public inspectionTopicId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MaterialInspection.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        materialId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'material_id',
            references: {
                model: Material, // Reference the Material model
                key: 'id',
            },
        },
        inspectionTopicId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'inspection_topic_id',
            references: {
                model: InspectionTopic, // Reference the InspectionTopic model
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'mis_material_inspection', // The name of your junction table
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['material_id', 'inspection_topic_id'], // Ensure unique pairing
            },
        ],
    }
);

export default MaterialInspection;
