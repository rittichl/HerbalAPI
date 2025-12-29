import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import InspectionTopic from './inspectionTopic.model'; // Import InspectionTopic model
import QuarantineList from './quarantineList.model'; // Import QuarantineList model


interface OrderDetailInspectionResultAttributes {
    id?: number;
    quarantineListId: number; // Changed: Foreign key for QuarantineList
    inspectionTopicId: number;
    result: number; // 0 for Not Pass, 1 for Pass
    createdAt?: Date;
    updatedAt?: Date;
}

class OrderDetailInspectionResult extends Model<OrderDetailInspectionResultAttributes> implements OrderDetailInspectionResultAttributes {
    public id!: number;
    public quarantineListId!: number; // Changed
    public inspectionTopicId!: number;
    public result!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Optional: Define associations if you need to access related data directly from this model instance
    public readonly quarantineList?: QuarantineList; // Changed to QuarantineList
    public readonly inspectionTopic?: InspectionTopic;
}

OrderDetailInspectionResult.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quarantineListId: { // Changed: References the QuarantineList table
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'quarantine_list_id',
            references: {
                model: QuarantineList, // Reference the QuarantineList model
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE', // If a QuarantineList entry is deleted, delete its results
        },
        inspectionTopicId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'inspection_topic_id',
            references: {
                model: InspectionTopic, // Reference the InspectionTopic model
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT', // Prevent deleting a topic if results exist (or CASCADE)
        },
        result: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: [[0, 1]], // Ensure result is either 0 or 1
            },
        },
    },
    {
        sequelize,
        tableName: 'mis_order_detail_inspection_result',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                // unique: true,
                fields: ['quarantine_list_id'], // Unique per quarantine list entry and topic
            },
            {
                fields: ['inspection_topic_id'],
            },
        ],
    }
);

export default OrderDetailInspectionResult;
