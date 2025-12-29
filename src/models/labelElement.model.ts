import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MisLabelTemplate } from './labelTemplate.model';


export interface MisLabelElementAttributes {
    id: number;
    labelTemplateId: number;
    elementId: string;
    label: string;
    x: number;
    y: number;
    size: number;
    bold: boolean;
    color: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class MisLabelElement extends Model<MisLabelElementAttributes> implements MisLabelElementAttributes {
    public id!: number;
    public labelTemplateId!: number;
    public elementId!: string;
    public label!: string;
    public x!: number;
    public y!: number;
    public size!: number;
    public bold!: boolean;
    public color!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MisLabelElement.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        labelTemplateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MisLabelTemplate,
                key: 'id',
            },
            validate: {
                notNull: { msg: 'labelTemplateId is required' },
                isInt: { msg: 'labelTemplateId must be an integer' }
            }
        },
        elementId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'elementId is required' },
                notEmpty: { msg: 'elementId cannot be empty' }
            }
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'label is required' },
                notEmpty: { msg: 'label cannot be empty' }
            }
        },
        x: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isFloat: { msg: 'x must be a number' }
            }
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isFloat: { msg: 'y must be a number' }
            }
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 16,
            validate: {
                isInt: { msg: 'size must be an integer' },
                min: { args: [1], msg: 'size must be at least 1' }
            }
        },
        bold: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#000000',
            validate: {
                notEmpty: { msg: 'color cannot be empty' }
            }
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
        tableName: 'mis_label_elements',
        modelName: 'MisLabelElement',
    }
);

// // Associations
// MisLabelElement.belongsTo(MisLabelTemplate, {
//     foreignKey: 'labelTemplateId',
//     as: 'template',
// });

// MisLabelTemplate.hasMany(MisLabelElement, {
//     foreignKey: 'labelTemplateId',
//     as: 'elements',
// });