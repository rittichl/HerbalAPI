import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface MenuCategoryAttributes {
    id?: number;
    name: string;
    description?: string | null;
    created_at?: Date;
    updated_at?: Date;
}

export class MenuCategory extends Model<MenuCategoryAttributes> implements MenuCategoryAttributes {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public readonly menuItems?: any[];

    public static initialize(sequelize: any) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                },
                description: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                created_at: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
                updated_at: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                tableName: 'mis_menu_categories',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );
    }

    public static associate(models: any) {
        this.hasMany(models.MenuItem, {
            foreignKey: 'category_id',
            as: 'menuItems',
        });
    }
}

// Initialize the model
MenuCategory.initialize(sequelize);

export default MenuCategory;

