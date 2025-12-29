import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Category from './category.model';
import { MaterialType, MaterialUnit } from '../constants/enum.data';
import InspectionTopic from './inspectionTopic.model';



interface MaterialAttributes {
    id?: number;
    materialId: string;
    categoryId?: string | null;
    barcode?: string | null;
    materialNameEn: string;
    materialNameTh: string;
    materialType?: MaterialType;
    packageNameTh?: string | null;
    packageNameEn?: string | null;
    stockVolume?: number | null;
    stockUnit?: MaterialUnit;
    createdAt?: Date;
    updatedAt?: Date;
    inspectionTopics?: InspectionTopic[];
}

class Material extends Model<MaterialAttributes> implements MaterialAttributes {
    public id!: number;
    public materialId!: string;
    public categoryId!: string | null;
    public barcode!: string | null;
    public materialNameEn!: string;
    public materialNameTh!: string;
    public materialType!: MaterialType;
    public packageNameTh!: string | null;
    public packageNameEn!: string | null;
    public stockVolume!: number | null;
    public stockUnit!: MaterialUnit;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly category?: Category;
    public inspectionTopics?: InspectionTopic[];

}

Material.init(
    {
        materialId: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'material_id',
            unique: true,
        },
        categoryId: {
            type: DataTypes.STRING(20),
            field: 'category_id',
            references: {
                model: Category,
                key: 'id',
            },
        },
        barcode: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        materialNameEn: {
            type: DataTypes.STRING(80),
            allowNull: true,
            field: 'material_name_en',
        },
        materialNameTh: {
            type: DataTypes.STRING(80),
            allowNull: false,
            field: 'material_name_th',
            validate: {
                notEmpty: true,
            },
        },
        materialType: {
            type: DataTypes.ENUM(...Object.values(MaterialType)),
            field: 'material_type',
            defaultValue: MaterialType.UNKNOWN,
        },
        packageNameTh: {
            type: DataTypes.STRING(80),
            allowNull: true,
            field: 'package_name_th',
        },
        packageNameEn: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'package_name_en',
        },
        stockVolume: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
            field: 'stock_volume',
            validate: {
                min: 0,
            },
        },
        stockUnit: {
            type: DataTypes.ENUM(...Object.values(MaterialUnit)),
            field: 'stock_unit',
            defaultValue: MaterialUnit.GRAM,
        },
    },
    {
        sequelize,
        tableName: 'mis_material',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['material_id'],
            },
            {
                fields: ['category_id'],
            },
            {
                fields: ['material_name_th'],
            },
            {
                fields: ['material_type'],
            },
        ],
    }
);

// Define associations
Material.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});

export { Material };