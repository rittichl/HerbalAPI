# Menu Permission System

This document describes the menu permission system that has been implemented to manage frontend menu access based on user groups.

## Database Tables

### 1. `mis_menu_categories`
Stores groups/categories of menus.

**Fields:**
- `id` (INTEGER, Primary Key, Auto Increment)
- `name` (STRING(100), Required) - Category name
- `description` (STRING(255), Optional) - Category description
- `created_at` (DATE, Auto)
- `updated_at` (DATE, Auto)

### 2. `mis_menu_items`
Stores individual menu items with their resource names and category links.

**Fields:**
- `id` (INTEGER, Primary Key, Auto Increment)
- `menu_name` (STRING(100), Required) - Display name of the menu
- `resource_name` (STRING(100), Required) - Resource identifier/route name
- `category_id` (INTEGER, Required, Foreign Key → `mis_menu_categories.id`)
- `created_at` (DATE, Auto)
- `updated_at` (DATE, Auto)

### 3. `mis_menu_permissions`
Stores permissions for each menu item per user group.

**Fields:**
- `id` (INTEGER, Primary Key, Auto Increment)
- `menu_item_id` (INTEGER, Required, Foreign Key → `mis_menu_items.id`)
- `user_group_id` (INTEGER, Required, Foreign Key → `mis_user_group.id`)
- `view` (BOOLEAN, Default: false) - Permission to view
- `add` (BOOLEAN, Default: false) - Permission to add
- `edit` (BOOLEAN, Default: false) - Permission to edit
- `delete` (BOOLEAN, Default: false) - Permission to delete
- `created_at` (DATE, Auto)
- `updated_at` (DATE, Auto)

## Model Files

1. **`src/models/menu.category.model.ts`** - MenuCategory model
2. **`src/models/menu.item.model.ts`** - MenuItem model
3. **`src/models/menu.permission.model.ts`** - MenuPermission model

## Associations

- **MenuCategory** `hasMany` **MenuItem** (via `category_id`)
- **MenuItem** `belongsTo` **MenuCategory**
- **MenuItem** `hasMany` **MenuPermission** (via `menu_item_id`)
- **MenuPermission** `belongsTo` **MenuItem**
- **MenuPermission** `belongsTo` **UserGroup** (via `user_group_id`)
- **UserGroup** `hasMany` **MenuPermission**

## Usage

The models are registered in `src/models/db.ts` and will be automatically synchronized when the server starts (using `db.sequelize.sync({ alter: true })`).

### Example: Creating Menu Categories and Items

```typescript
import db from './models/db';

// Create a menu category
const category = await db.MenuCategory.create({
    name: 'Administration',
    description: 'Administrative menus'
});

// Create a menu item
const menuItem = await db.MenuItem.create({
    menu_name: 'User Management',
    resource_name: 'users',
    category_id: category.id
});
```

### Example: Setting Permissions

```typescript
// Grant permissions to a user group
await db.MenuPermission.create({
    menu_item_id: menuItem.id,
    user_group_id: userGroup.id,
    view: true,
    add: true,
    edit: true,
    delete: false
});
```

### Example: Querying Permissions for a User Group

```typescript
const permissions = await db.MenuPermission.findAll({
    where: { user_group_id: userGroupId },
    include: [
        {
            model: db.MenuItem,
            as: 'menuItem',
            include: [
                {
                    model: db.MenuCategory,
                    as: 'category'
                }
            ]
        }
    ]
});
```

## Next Steps

You may want to create:
1. **Controllers** - To handle CRUD operations for menu categories, items, and permissions
2. **Routes** - API endpoints for managing menus and permissions
3. **Services** - Business logic for permission checking and menu retrieval
4. **Middleware** - To check user permissions based on their group

