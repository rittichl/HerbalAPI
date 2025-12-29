import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface MenuPermissionAttributes {
    id?: number;
    menu_item_id: number;
    user_group_id: number;
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export class MenuPermission extends Model<MenuPermissionAttributes> implements MenuPermissionAttributes {
    public id!: number;
    public menu_item_id!: number;
    public user_group_id!: number;
    public view!: boolean;
    public add!: boolean;
    public edit!: boolean;
    public delete!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public readonly menuItem?: any;
    public readonly userGroup?: any;

    public static initialize(sequelize: any) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                menu_item_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'mis_menu_items',
                        key: 'id'
                    },
                },
                user_group_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'mis_user_group',
                        key: 'id'
                    },
                },
                view: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                add: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                edit: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                delete: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
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
                tableName: 'mis_menu_permissions',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );
    }

    public static associate(models: any) {
        this.belongsTo(models.MenuItem, {
            foreignKey: 'menu_item_id',
            as: 'menuItem',
        });
        this.belongsTo(models.UserGroup, {
            foreignKey: 'user_group_id',
            as: 'userGroup',
        });
    }
}

// Initialize the model
MenuPermission.initialize(sequelize);

export default MenuPermission;

