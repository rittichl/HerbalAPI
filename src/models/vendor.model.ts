import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface VendorAttributes {
    id?: number; // Changed from string to number
    vendor_name_th: string;
    vendor_name_en: string;
    mobile_number: string;
    address?: string | null;
    email?: string | null;
    contact?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

class Vendor extends Model<VendorAttributes> implements VendorAttributes {
    public id!: number; // Changed from string to number
    public vendor_name_th!: string;
    public vendor_name_en!: string;
    public mobile_number!: string;
    public address?: string | null;
    public email?: string | null;
    public contact?: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Vendor.init(
    {
        id: {
            type: DataTypes.INTEGER, // Changed from STRING to INTEGER
            primaryKey: true,
            autoIncrement: true, // Added auto-increment
        },
        vendor_name_th: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        vendor_name_en: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        mobile_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        contact: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'mis_vendor',
        timestamps: true,
    }
);

export default Vendor;