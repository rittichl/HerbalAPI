import { DataTypes, Model, Op } from 'sequelize';
import sequelize from '../config/database';
import { MaterialUnit } from '../constants/enum.data';
// import { MaterialUnit } from '../constants/enum';

interface QuarantineListAttributes {
    id?: number;
    qt_id: string;
    order_id: string;
    material_id: string;
    amount: number;
    unit: MaterialUnit;
    admit_date: Date;
    due_date: Date;
    audit_result: string | null;
    audit_status: number;
    auditor: number;
    inspector: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class QuarantineList extends Model<QuarantineListAttributes> implements QuarantineListAttributes {
    public id!: number;
    public qt_id!: string;
    public order_id!: string;
    public material_id!: string;
    public amount!: number;
    public unit!: MaterialUnit;
    public admit_date!: Date;
    public due_date!: Date;
    public audit_result!: string | null;
    public audit_status!: number;
    public auditor!: number;
    public inspector!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Method to generate QT ID
    public static async generateQtId(): Promise<string> {
        const currentYear = new Date().getFullYear();
        const lastRecord = await QuarantineList.findOne({
            where: {
                qt_id: {
                    [Op.like]: `QT-${currentYear}-%`
                }
            },
            order: [['qt_id', 'DESC']]
        });

        let runningNumber = 1;
        if (lastRecord) {
            const lastNumber = parseInt(lastRecord.qt_id.split('-')[2]);
            runningNumber = lastNumber + 1;
        }

        return `QT-${currentYear}-${runningNumber.toString().padStart(6, '0')}`;
    }
}

QuarantineList.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    qt_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mis_order',
            key: 'id'
        }
    },
    material_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mis_material',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    unit: {
        type: DataTypes.ENUM(...Object.values(MaterialUnit)),
        allowNull: false,
        defaultValue: MaterialUnit.UNIT
    },
    admit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    audit_result: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    audit_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'mis_audit_status',
            key: 'id'
        },
        // defaultValue: 1 // Assuming 1 is the default status (e.g., "Pending")
    },
    auditor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'mis_user',
            key: 'id'
        }
    },
    inspector: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'mis_user',
            key: 'id'
        }
    }
}, {
    sequelize,
    tableName: 'mis_quarantine_list',
    timestamps: true,
    // hooks: {
    //     beforeCreate: async (quarantine) => {
    //         quarantine.qt_id = await QuarantineList.generateQtId();
    //     }
    // }
});

export default QuarantineList;