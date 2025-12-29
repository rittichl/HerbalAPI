import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface AuditStatusAttributes {
    id?: number;
    status_code: string;
    status_name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class AuditStatus extends Model<AuditStatusAttributes> implements AuditStatusAttributes {
    public id!: number;
    public status_code!: string;
    public status_name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

AuditStatus.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        status_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            }
        },
        status_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        }
    },
    {
        sequelize,
        tableName: 'mis_audit_status',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['status_code']
            }
        ]
    }
);

export default AuditStatus;