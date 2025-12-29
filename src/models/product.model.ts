import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaterialUnit } from '../constants/enum.data';


interface ProductAttributes {
    id?: number;
    productId: string;
    productNameEn: string;
    productNameTh: string;
    quantity?: number | null;
    productUnit?: MaterialUnit;
    createdAt?: Date;
    updatedAt?: Date;
}

class Product extends Model<ProductAttributes> implements ProductAttributes {
    public id!: number;
    public productId!: string;
    public productNameEn!: string;
    public productNameTh!: string;
    public quantity!: number | null;
    public productUnit!: MaterialUnit;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Product.init(
    {
        productId: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'product_id',
            unique: true,
        },
        productNameEn: {
            type: DataTypes.STRING(80),
            allowNull: true,
            field: 'product_name_en',
        },
        productNameTh: {
            type: DataTypes.STRING(80),
            allowNull: false,
            field: 'product_name_th',
            validate: {
                notEmpty: true,
            },
        },
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
            field: 'quantity',
            validate: {
                min: 0,
            },
        },
        productUnit: {
            type: DataTypes.ENUM(...Object.values(MaterialUnit)),
            field: 'unit',
            defaultValue: MaterialUnit.GRAM,
        },
    },
    {
        sequelize,
        tableName: 'mis_product',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['product_id'],
            }
        ],
    }
);


export { Product };