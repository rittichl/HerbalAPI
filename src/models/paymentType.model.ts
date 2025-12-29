import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import OrderDetail from './orderDetail.model';

interface PaymentTypeAttributes {
    id?: number;
    payment_type_th: string;
    payment_type_en: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class PaymentType extends Model<PaymentTypeAttributes> implements PaymentTypeAttributes {
    public id!: number;
    public payment_type_th!: string;
    public payment_type_en!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PaymentType.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        payment_type_th: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        payment_type_en: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'mis_payment_types',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

// PaymentType.hasMany(OrderDetail, {
//     foreignKey: 'payment_id',
//     as: 'order_details'
// });

export default PaymentType;