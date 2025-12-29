import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database'; // Assuming this path is correct

interface InspectionTopicAttributes {
    id?: number;
    inspect_id: string; // Changed from inspectId to inspect_id
    inspect_name: string; // Changed from inspectName to inspect_name
    topics: string;
    method: string;
    specification: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class InspectionTopic extends Model<InspectionTopicAttributes> implements InspectionTopicAttributes {
    public id!: number;
    public inspect_id!: string; // Changed from inspectId to inspect_id
    public inspect_name!: string; // Changed from inspectName to inspect_name
    public topics!: string;
    public method!: string;
    public specification!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

InspectionTopic.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        inspect_id: { // Changed from inspectId to inspect_id
            type: DataTypes.STRING(20), // Sufficient for MDxxxx format
            allowNull: false,
            unique: true,
            field: 'inspect_id', // Ensure the field name in the database is also inspect_id
            // You might want to add a custom validator here for the MDxxxx format
            // validate: {
            //     isInspectIdFormat(value: string) {
            //         if (!/^MD\d{4}$/.test(value)) {
            //             throw new Error('Inspect ID must be in MDxxxx format (e.g., MD0001)');
            //         }
            //     }
            // }
        },
        inspect_name: { // Changed from inspectName to inspect_name
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'inspect_name', // Ensure the field name in the database is also inspect_name
            validate: {
                notEmpty: true,
            },
        },
        topics: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true, // <--- Made 'topics' unique
        },
        method: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        specification: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'mis_inspection_topics',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['inspect_id'],
                unique: true,
            },
            {
                fields: ['inspect_name'],
            },
            {
                fields: ['topics'], // <--- Added this index for the unique constraint on 'topics'
                unique: true,
            },
        ],
    }
);

export default InspectionTopic;
