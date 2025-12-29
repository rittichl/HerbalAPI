import sequelize from '../config/database';
import User from './user.model';
import UserGroup from './user_group.model';
import Category from './category.model';
import { Material } from './material.model';
import { Product } from './product.model';
import { ProductFormula } from './product.formula.model';
import Vendor from './vendor.model';
import Order from './order.model';
import OrderDetail from './orderDetail.model';
import PaymentType from './paymentType.model';
import AuditStatus from './auditStatus.model';
import QuarantineList from './quarantineList.model';
import InspectionTopic from './inspectionTopic.model';
import MaterialInspection from './materialInspection.model';
import OrderDetailInspectionResult from './orderDetailInspectionResult.model';
import { MisLabelTemplate } from './labelTemplate.model';
import { MisLabelElement } from './labelElement.model';
import { MisQRCode } from './qrcode.model';
import MenuCategory from './menu.category.model';
import MenuItem from './menu.item.model';
import MenuPermission from './menu.permission.model';
// import { LabelTemplate } from './labelTemplate.model';
// import { LabelElement } from './labelElement.model';
// import { QRCode } from './qrcode.model';


const db = {
    sequelize,
    User,
    UserGroup,
    Category,
    Material,
    Product,
    ProductFormula,
    Vendor,
    Order,
    OrderDetail,
    PaymentType,
    AuditStatus,
    QuarantineList,
    InspectionTopic,
    MaterialInspection,
    OrderDetailInspectionResult,
    MisLabelTemplate,
    MisLabelElement,
    MisQRCode,
    MenuCategory,
    MenuItem,
    MenuPermission
};

// After initializing models, set up associations
ProductFormula.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

ProductFormula.belongsTo(Material, {
    foreignKey: 'materialId',
    as: 'material'
});

Product.hasMany(ProductFormula, {
    foreignKey: 'productId',
    as: 'formulas'
});

Material.hasMany(ProductFormula, {
    foreignKey: 'materialId',
    as: 'usedInFormulas'
});


Order.hasMany(OrderDetail, {
    foreignKey: 'order_id',
    as: 'details',
    onDelete: 'CASCADE'
});

OrderDetail.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
});

Material.hasMany(OrderDetail, {
    foreignKey: 'material_id',
    as: 'orderDetails',
});

Order.belongsTo(PaymentType, {
    foreignKey: 'payment_id',
    as: 'payment_type'
});

PaymentType.hasMany(Order, {
    foreignKey: 'payment_id',
    as: 'orders'
});

// Existing QuarantineList associations
QuarantineList.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
});

QuarantineList.belongsTo(Material, {
    foreignKey: 'material_id',
    as: 'material'
});

QuarantineList.belongsTo(AuditStatus, {
    foreignKey: 'audit_status',
    as: 'status'
});

QuarantineList.belongsTo(User, {
    foreignKey: 'auditor',
    as: 'auditor_user'
});

QuarantineList.belongsTo(User, {
    foreignKey: 'inspector',
    as: 'inspector_user'
});

// --- NEW: Association from OrderDetail to QuarantineList ---
OrderDetail.hasMany(QuarantineList, {
    foreignKey: 'order_id', // Link to OrderDetail's parent order_id
    sourceKey: 'order_id', // Link to OrderDetail's order_id
    constraints: false, // Important: disable constraints here if OrderDetail's order_id is not unique
    as: 'quarantineList', // This alias must match the one used in the include for OrderDetail
});
// You might also need a specific association if QuarantineList identifies a *unique* order_detail:
// QuarantineList.belongsTo(OrderDetail, {
//     foreignKey: ['order_id', 'material_id'], // If OrderDetail has a composite primary key or unique index
//     targetKey: ['order_id', 'material_id'],
//     as: 'orderDetailEntry'
// });
// However, given your current models, the above `OrderDetail.hasMany(QuarantineList)` using `order_id` is a simpler starting point.

// --- Consider if this association below is still needed if QuarantineList is the new hub ---
// Material.hasMany(OrderDetail, {
//     foreignKey: 'material_id',
//     as: 'orderDetails',
// });
// --- End Consider ---


Material.belongsToMany(InspectionTopic, {
    through: MaterialInspection,
    foreignKey: 'materialId',
    otherKey: 'inspectionTopicId',
    as: 'inspectionTopics',
});

InspectionTopic.belongsToMany(Material, {
    through: MaterialInspection,
    foreignKey: 'inspectionTopicId',
    otherKey: 'materialId',
    as: 'materials',
});

MaterialInspection.belongsTo(Material, {
    foreignKey: 'materialId',
    as: 'material'
});

MaterialInspection.belongsTo(InspectionTopic, {
    foreignKey: 'inspectionTopicId',
    as: 'inspectionTopic'
});

// Associations for QuarantineList and OrderDetailInspectionResult
QuarantineList.hasMany(OrderDetailInspectionResult, {
    foreignKey: 'quarantineListId',
    as: 'inspectionResults',
    onDelete: 'CASCADE',
});

OrderDetailInspectionResult.belongsTo(QuarantineList, {
    foreignKey: 'quarantineListId',
    as: 'quarantineList'
});

InspectionTopic.hasMany(OrderDetailInspectionResult, {
    foreignKey: 'inspectionTopicId',
    as: 'results',
    onDelete: 'RESTRICT'
});

OrderDetailInspectionResult.belongsTo(InspectionTopic, {
    foreignKey: 'inspectionTopicId',
    as: 'inspectionTopic'
});

// Initialize associations
Object.values(db).forEach((model: any) => {
    if (model.associate) {
        model.associate(db);
    }
});

MisLabelTemplate.hasMany(MisLabelElement, {
    foreignKey: 'labelTemplateId',
    as: 'elements',
    sourceKey: 'id'
});

MisLabelTemplate.hasMany(MisQRCode, {
    foreignKey: 'template_id',
    as: 'qrCodes',
    sourceKey: 'id'
});

MisLabelElement.belongsTo(MisLabelTemplate, {
    foreignKey: 'labelTemplateId',
    as: 'template',
    targetKey: 'id'
});

MisQRCode.belongsTo(MisLabelTemplate, {
    foreignKey: 'template_id',
    as: 'template',
    targetKey: 'id'
});

// Menu associations - UserGroup has many MenuPermissions
// (This association is here since UserGroup.associate() doesn't use models parameter)
UserGroup.hasMany(MenuPermission, {
    foreignKey: 'user_group_id',
    as: 'menuPermissions',
});

export default db;
