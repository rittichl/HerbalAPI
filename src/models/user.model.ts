import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { UserGroup } from './user_group.model';
import bcrypt from 'bcrypt';
import { UserRole } from '../constants/enum.data';


interface UserAttributes {
    id?: number;
    group_id: number;
    name: string;
    position?: string | null;
    username: string;
    password: string;
    role?: UserRole;
    // create_date?: Date | null;
    create_by?: string | null;
    // lasttime?: Date | null;
    created_at?: Date;
    updated_at?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public group_id!: number;
    public name!: string;
    public position!: string | null;
    public username!: string;
    public password!: string;
    public role!: UserRole;
    // public create_date!: Date | null;
    public create_by!: string | null;
    // public lasttime!: Date | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public readonly group?: UserGroup;

    public static initialize(sequelize: any) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                group_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'mis_user_group',
                        key: 'id'
                    },
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                position: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                username: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true,
                },
                // password: {
                //     type: DataTypes.STRING(255),
                //     allowNull: false,
                // },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    set(value: string) {
                        // Hash the password before saving
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(value, salt);
                        this.setDataValue('password', hash);
                    },
                },
                // role: {
                //     type: DataTypes.STRING(20),
                //     allowNull: true,
                // },
                role: {
                    type: DataTypes.ENUM(...Object.values(UserRole)),
                    field: 'role',
                    defaultValue: UserRole.USER,
                },
                // create_date: {
                //     type: DataTypes.DATE,
                //     allowNull: true,
                // },
                create_by: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                // lasttime: {
                //     type: DataTypes.DATE,
                //     allowNull: true,
                // },
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
                tableName: 'mis_user',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );
    }

    public static associate() {
        this.belongsTo(UserGroup, {
            foreignKey: 'group_id',
            as: 'group',
        });
    }

    public async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}

// Initialize the model
User.initialize(sequelize);

export default User;