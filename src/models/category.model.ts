import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { Material } from './material.model';

interface CategoryAttributes {
    id: string;
    name: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

class Category extends Model<CategoryAttributes> implements CategoryAttributes {
    public id!: string;
    public name!: string;
    public description?: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;


    public static associate(models: any) {
        Category.hasMany(models.Material, {
            foreignKey: 'categoryId',
            as: 'materials'
        });
    }

    // public static associate() {
    //     Category.hasMany(Stock, {
    //         foreignKey: 'categoryId',
    //         as: 'stocks',
    //         onDelete: 'RESTRICT', // Prevent delete if stocks exist
    //         hooks: true // Enable hooks for this association
    //     });
    // }

    // // Custom methods can be added here
    // public async getStockCount(): Promise<number> {
    //     return await Stock.count({ where: { categoryId: this.id } });
    // }

}

Category.init(
    {
        id: {
            type: DataTypes.STRING(20),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'mis_categories',
        timestamps: true,
    }
);





export default Category;