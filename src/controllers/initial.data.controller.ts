import { UserRole } from '../constants/enum.data';
import { User } from '../models/user.model';
import UserGroup from '../models/user_group.model';


export const InitialController = {
    async createDefaultUserGroup() {
        try {

            console.log("Call Create Default User Group")
            const usergroupExists = await UserGroup.findByPk(1)
            if (!usergroupExists) {
                await UserGroup.create({
                    id: 1,
                    group_code: 'A001',
                    group_name: 'admin'
                })
                console.log('UserGroup created successfully');
            } else {
                console.log('UserGroup already exists');

            }

        } catch (error) {
            console.error('Error creating default user group:', error);
        }
    },

    async createAdminUser() {
        try {

            console.log("Call Create Admin")
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
        }
    },

}


// async function createAdminUser() {
//     try {

//         console.log("Call Create Admin")
//         const adminExists = await User.findOne({ where: { username: 'admin' } });

//         if (!adminExists) {
//             await User.create({
//                 group_id: 1, // Assuming group_id 1 is for admins
//                 name: 'Administrator',
//                 username: 'admin',
//                 password: 'dhh12345', // Will be automatically hashed by your model
//                 type: 'admin',
//                 create_by: 'system'
//             });

//             console.log('Admin user created successfully');
//         } else {
//             console.log('Admin user already exists');
//         }
//     } catch (error) {
//         console.error('Error creating admin user:', error);
//     }
// }

// // createAdminUser();
// export { createAdminUser }