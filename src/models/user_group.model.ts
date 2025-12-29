import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

interface UserGroupAttributes {
    id?: number;
    group_code: string;
    group_name: string;
    created_at?: Date;
    updated_at?: Date;
}

export class UserGroup extends Model<UserGroupAttributes> implements UserGroupAttributes {
    public id!: number;
    public group_code!: string;
    public group_name!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public readonly users?: User[];

    public static initialize(sequelize: any) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                group_code: {
                    type: DataTypes.STRING(10),
                    allowNull: false,
                    unique: true,
                },
                group_name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
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
                tableName: 'mis_user_group',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );
    }

    public static associate() {
        this.hasMany(User, {
            foreignKey: 'group_id',
            as: 'users',
        });
    }
}

// Initialize the model
UserGroup.initialize(sequelize);

export default UserGroup;