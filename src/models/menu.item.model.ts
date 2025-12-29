import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface MenuItemAttributes {
    id?: number;
    menu_name: string;
    resource_name?: string | null;
    category_id: number;
    created_at?: Date;
    updated_at?: Date;
}

export class MenuItem extends Model<MenuItemAttributes> implements MenuItemAttributes {
    public id!: number;
    public menu_name!: string;
    public resource_name!: string | null;
    public category_id!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public readonly category?: any;
    public readonly permissions?: any[];

    public static initialize(sequelize: any) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                menu_name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                },
                resource_name: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                category_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'mis_menu_categories',
                        key: 'id'
                    },
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
                tableName: 'mis_menu_items',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );
    }

    public static associate(models: any) {
        this.belongsTo(models.MenuCategory, {
            foreignKey: 'category_id',
            as: 'category',
        });
        this.hasMany(models.MenuPermission, {
            foreignKey: 'menu_item_id',
            as: 'permissions',
        });
    }
}

// Initialize the model
MenuItem.initialize(sequelize);

export default MenuItem;

