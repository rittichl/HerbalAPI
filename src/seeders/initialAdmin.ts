import { User } from '../models/user.model';
import sequelize from '../config/database';
import db from '../models/db';
import { UserRole } from '../constants/enum.data';


async function createAdminUser() {
    try {

        await db.sequelize.authenticate();
        // await sequelize.sync(); // Ensure tables are created

        const adminExists = await User.findOne({ where: { username: 'admin' } });

        if (!adminExists) {
            await User.create({
                group_id: 1, // Assuming group_id 1 is for admins
                name: 'Administrator',
                username: 'admin',
                password: 'dhh12345', // Will be automatically hashed by your model
                role: UserRole.ADMIN,
                create_by: 'system'
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await sequelize.close();
    }
}

createAdminUser();