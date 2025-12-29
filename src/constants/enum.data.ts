// Define enum types in TypeScript
enum MaterialType {
    ROOT = 'ราก',
    STEM = 'แก่น',
    BULB = 'หัว',
    FLOWER = 'ดอก',
    LEAF = 'ใบ',
    VINE = 'เถา',
    FRUIT = 'ผล',
    TREE = 'ต้น',
    UNKNOWN = 'unknown'
}

enum MaterialUnit {
    GRAM = 'g',
    MILLIGRAM = 'mg',
    KILOGRAM = 'kg',
    MILLILITER = 'ml',
    LITER = 'L',
    UNIT = 'unit'
}

enum UserRole {
    ADMIN = 'admin',
    MANAGEMENT = 'management',
    USER = 'user',
}


export { MaterialType, MaterialUnit, UserRole };