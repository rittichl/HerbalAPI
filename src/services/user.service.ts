// import db from '../models';
// import User from '../models/user.model';  // Remove the curly braces


// class UserService {
//     async createUser(userData: {
//         name: string;
//         email: string;
//         password: string;
//     }): Promise<User> {
//         try {
//             const user = await db.User.create(userData);
//             return user;
//         } catch (error) {
//             throw new Error('Error creating user');
//         }
//     }

//     async findUserByEmail(email: string): Promise<User | null> {
//         return await db.User.findOne({ where: { email } });
//     }
// }

// export default new UserService();