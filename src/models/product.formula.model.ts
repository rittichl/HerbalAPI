import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Category from './category.model';
import { MaterialUnit } from '../constants/enum.data';
import { Product } from './product.model';
import { Material } from './material.model';



interface ProductFormulaAttributes {
    id?: number;
    productId: number; // Foreign key to mis_product.id
    materialId: number; // Foreign key to mis_stock.id
    quantity?: number | null;
    unit?: MaterialUnit;
    createdAt?: Date;
    updatedAt?: Date;
}

class ProductFormula extends Model<ProductFormulaAttributes> implements ProductFormulaAttributes {
    public id!: number;
    public productId!: number;
    public materialId!: number;
    public quantity!: number | null;
    public unit!: MaterialUnit;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // These will be added by associations
    public readonly product?: Product;
    public readonly material?: Material;
}

ProductFormula.init(
    {
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_id'
        },
        materialId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'material_id'
        },
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
            field: 'quantity',
            validate: {
                min: 0,
            },
        },
        unit: {
            type: DataTypes.ENUM(...Object.values(MaterialUnit)),
            field: 'unit',
            defaultValue: MaterialUnit.GRAM,
        },
    },
    {
        sequelize,
        tableName: 'mis_product_formula',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['product_id']
            },
            {
                fields: ['material_id']
            },
            {
                fields: ['product_id', 'material_id'],
                unique: true
            }
        ]
    }
);

// Define associations
ProductFormula.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});

export { ProductFormula };