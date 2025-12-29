import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MisLabelElement } from './labelElement.model';
import { MisQRCode } from './qrcode.model';



export interface MisLabelTemplateAttributes {
    id: number;
    templateName: string;
    registerNo: string;
    lotNo: string;
    companyName: string;
    branch: string;
    productionDate: String;
    expiryDate: String;
    stickerNo: string;
    quantity: number;
    imageUrl: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    imageType: string | null;
    previewImageUrl: string | null;
    previewGeneratedAt: Date | null;
    compositeImageUrl?: string | null;
    approve: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MisLabelTemplateCreationAttributes extends Optional<MisLabelTemplateAttributes, 'id' | 'imageUrl' | 'imageWidth' | 'imageHeight' | 'imageType' | 'previewImageUrl' | 'previewGeneratedAt' | 'createdAt' | 'updatedAt'> { }

export class MisLabelTemplate extends Model<InferAttributes<MisLabelTemplate>, InferCreationAttributes<MisLabelTemplate>> implements MisLabelTemplateAttributes {
    declare id: CreationOptional<number>;
    declare templateName: string;
    declare registerNo: string;
    declare lotNo: string;
    declare companyName: string;
    declare branch: string;
    declare productionDate: String;
    declare expiryDate: String;
    declare stickerNo: string;
    declare quantity: number;
    declare imageUrl: CreationOptional<string | null>;
    declare imageWidth: CreationOptional<number | null>;
    declare imageHeight: CreationOptional<number | null>;
    declare imageType: CreationOptional<string | null>;
    declare previewImageUrl: CreationOptional<string | null>;
    declare previewGeneratedAt: CreationOptional<Date | null>;
    declare compositeImageUrl: CreationOptional<string | null>;
    declare approve: number;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    // Declare associations
    declare elements?: MisLabelElement[];
    declare qrCodes?: MisQRCode[];

    public static associations: {
        elements: import('sequelize').Association<MisLabelTemplate, MisLabelElement>;
        qrCodes: import('sequelize').Association<MisLabelTemplate, MisQRCode>;
    };
}


MisLabelTemplate.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        templateName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        registerNo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lotNo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        branch: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        productionDate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiryDate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stickerNo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        imageWidth: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        imageHeight: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        imageType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        previewImageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        previewGeneratedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        compositeImageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approve: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        tableName: 'mis_label_templates',
        modelName: 'MisLabelTemplate',
    }



);