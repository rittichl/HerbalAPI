import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Order from './order.model';
import { Material } from './material.model';
import PaymentType from './paymentType.model';
import { MaterialUnit } from '../constants/enum.data';
import QuarantineList from './quarantineList.model';

interface OrderDetailAttributes {
    id?: number;
    order_id: number;
    material_id: number;
    amount: number;
    price: number;
    order_unit: MaterialUnit;
    createdAt?: Date;
    updatedAt?: Date;

    quarantineList?: QuarantineList[];

}

class OrderDetail extends Model<OrderDetailAttributes> implements OrderDetailAttributes {
    public id!: number;
    public order_id!: number;
    public material_id!: number;
    public amount!: number;
    public price!: number;
    public order_unit!: MaterialUnit;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public quarantineList?: QuarantineList[];
}

OrderDetail.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Order,
                key: 'id',
            },
        },
        material_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Material,
                key: 'id',
            },
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        order_unit: {
            type: DataTypes.ENUM(...Object.values(MaterialUnit)),
            allowNull: false,
            defaultValue: MaterialUnit.UNIT,
            validate: {
                isIn: [Object.values(MaterialUnit)]
            }
        }
    },
    {
        sequelize,
        tableName: 'mis_order_detail',
        timestamps: true,
    }
);

// Associations
// OrderDetail.belongsTo(Order, {
//     foreignKey: 'order_id',
//     as: 'order',
// });

// OrderDetail.belongsTo(Order, {
//     foreignKey: 'order_id',
//     as: 'order',
// });

OrderDetail.belongsTo(Material, {
    foreignKey: 'material_id',
    as: 'material',
});



// OrderDetail.belongsTo(PaymentType, {
//     foreignKey: 'payment_id',
//     as: 'payment_type'
// });

export default OrderDetail;