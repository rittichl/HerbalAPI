import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import OrderDetail from './orderDetail.model'; // Import OrderDetail model
import User from './user.model'; // Import User model for inspector/auditor
import AuditStatus from './auditStatus.model'; // Import AuditStatus model

interface OrderDetailInspectionBatchAttributes {
    id?: number;
    orderDetailId: number;
    qtCode: string; // QTymmddxxxx format
    auditDate: Date; // Date only
    inspectorId?: number | null; // Foreign key to User
    auditorId?: number | null; // Foreign key to User
    auditStatusId?: number | null; // Foreign key to AuditStatus
    auditRemark?: string | null; // Text field
    createdAt?: Date;
    updatedAt?: Date;
}

class OrderDetailInspectionBatch extends Model<OrderDetailInspectionBatchAttributes> implements OrderDetailInspectionBatchAttributes {
    public id!: number;
    public orderDetailId!: number;
    public qtCode!: string;
    public auditDate!: Date;
    public inspectorId!: number | null;
    public auditorId!: number | null;
    public auditStatusId!: number | null;
    public auditRemark!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Optional: Define associations if you need to access related data directly from this model instance
    public readonly orderDetail?: OrderDetail;
    public readonly inspector?: User;
    public readonly auditor?: User;
    public readonly auditStatus?: AuditStatus;
}

OrderDetailInspectionBatch.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        orderDetailId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'order_detail_id',
            references: {
                model: OrderDetail, // Reference the OrderDetail model
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE', // If an OrderDetail is deleted, delete its batches
        },
        qtCode: {
            type: DataTypes.STRING(20), // QTymmddxxxx
            allowNull: false,
            unique: true, // qtCode should be unique
            field: 'qt_code',
        },
        auditDate: {
            type: DataTypes.DATEONLY, // Stores only date, no time
            allowNull: false,
            field: 'audit_date',
        },
        inspectorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'inspector_id',
            references: {
                model: User, // Reference the User model
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL', // If inspector is deleted, set to null
        },
        auditorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'auditor_id',
            references: {
                model: User, // Reference the User model
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL', // If auditor is deleted, set to null
        },
        auditStatusId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'audit_status_id',
            references: {
                model: AuditStatus, // Reference the AuditStatus model
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL', // If audit status is deleted, set to null
        },
        auditRemark: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'audit_remark',
        },
    },
    {
        sequelize,
        tableName: 'mis_order_detail_inspection_batch', // The new table name
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['qt_code'], // Ensure unique qt_code
            },
            {
                fields: ['order_detail_id'],
            },
            {
                fields: ['audit_date'],
            },
        ],
    }
);

export default OrderDetailInspectionBatch;
