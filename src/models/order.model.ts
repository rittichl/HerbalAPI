import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Vendor from './vendor.model';
import OrderDetail from './orderDetail.model';

interface OrderAttributes {
    id?: number;
    order_id: string;
    order_date: Date;
    vendor_id: number;
    payment_id?: number;  // Add this
    delivery_days: number; // Add this
    createdAt?: Date;
    updatedAt?: Date;
}

class Order extends Model<OrderAttributes> implements OrderAttributes {
    [x: string]: any;
    public id!: number;
    public order_id!: string;
    public order_date!: Date;
    public vendor_id!: number;
    public payment_id!: number;
    public delivery_days!: number; // Add this
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        order_date: {
            // type: DataTypes.DATE,
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Vendor,
                key: 'id',
            },
        },
        payment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'mis_payment_types',
                key: 'id'
            }
        },
        delivery_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        }
    },

    {
        sequelize,
        tableName: 'mis_order',
        timestamps: true,
    }
);

// Associate with Vendor
Order.belongsTo(Vendor, {
    foreignKey: 'vendor_id',
    as: 'vendor',
});




export default Order;