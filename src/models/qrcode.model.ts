import sequelize from '../config/database';
import { DataTypes, Model, Optional, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { MisLabelTemplate } from './labelTemplate.model';
// import { sequelize } from '../config/database';
// import { MisLabelTemplate } from './mis_label_template.model';

export interface MisQRCodeAttributes {
    id: number;
    template_id: number;
    no: number;
    qrcode: string;
    sell_status: number;
    sell_province: string | null;
    sell_region: string | null;
    latitude: number;
    longitude: number;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for creation
export interface MisQRCodeCreationAttributes extends Optional<MisQRCodeAttributes, 'id' | 'sell_province' | 'sell_region' | 'description' | 'createdAt' | 'updatedAt'> { }

export class MisQRCode extends Model<InferAttributes<MisQRCode>, InferCreationAttributes<MisQRCode>> implements MisQRCodeAttributes {
    declare id: CreationOptional<number>;
    declare template_id: number;
    declare no: number;
    declare qrcode: string;
    declare sell_status: number;
    declare sell_province: CreationOptional<string | null>;
    declare sell_region: CreationOptional<string | null>;
    declare latitude: number;
    declare longitude: number;
    declare description: CreationOptional<string | undefined>;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    // Declare associations for TypeScript
    declare template?: MisLabelTemplate;

    // Static associations
    public static associations: {
        template: import('sequelize').Association<MisQRCode, MisLabelTemplate>;
    };
}

MisQRCode.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MisLabelTemplate,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        no: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Sequence number',
        },
        qrcode: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        sell_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sell_province: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sell_region: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'mis_qrcode',
        modelName: 'MisQRCode',
        indexes: [
            {
                fields: ['template_id'],
            },
            {
                fields: ['template_id', 'no'],
                unique: true,
            },
            {
                fields: ['sell_status'],
            },
            {
                fields: ['qrcode'],
            },
        ],
    }
);

// Associations - MUST be defined after init
// MisQRCode.belongsTo(MisLabelTemplate, {
//     foreignKey: 'template_id',
//     as: 'template',
//     targetKey: 'id'
// });

// MisLabelTemplate.hasMany(MisQRCode, {
//     foreignKey: 'template_id',
//     as: 'qrCodes',
//     sourceKey: 'id'
// });

// Add this to ensure proper typing
export type MisQRCodeWithTemplate = MisQRCode & {
    template?: MisLabelTemplate;
};