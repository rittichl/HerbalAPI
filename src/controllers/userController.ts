import { Request, Response } from 'express';
import User from '../models/user.model';
import UserGroup from '../models/user_group.model';
import msg from '../constants/msg.json';
import bcrypt from 'bcrypt';
import { cookieOptions, generateToken } from '../utility/util.function';

// jwt.sign(
//         { username: username, application: application, jti: jti },
//         config.jwt_secret, { expiresIn: config.token_life }
//       )

// Cookie options


export const test = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Test route works!'
    });
};




export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ['password'],
            },
            include: [{
                model: UserGroup,
                as: 'group',
                attributes: ['id', 'group_code', 'group_name']
            }],
            order: [['id', 'ASC']]

        });

        return res.status(200).json({ code: 0, message: msg["0"], data: { users } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: msg["500"] });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(200).json({
                code: 101,
                message: msg["101"], detail: `user_id ${id}`,
            });
        }

        const userGroup = await UserGroup.findByPk(updates.group_id);
        if (!userGroup) {
            return res.status(200).json({
                code: 101,
                message: msg["101"],
                detail: `group_id ${updates.group_id}`,
            });
        }

        updates.group_id = userGroup.id
        console.log(updates)
        await user.update(updates);


        const { password, ...safeUser } = user.get();
        return res.json({ code: 0, message: msg["0"], data: safeUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: msg["500"] });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(200).json({
                code: 101,
                message: msg["101"],
                detail: `user_id ${id}`,
            });
        }

        // 2. Check permissions (example: admin or self-deletion)
        const isAdmin = req.user!.username === 'admin';
        const isSelf = req.user!.id === user.id;

        if (!isAdmin && !isSelf) {
            return res.status(200).json({ code: 110, message: msg["110"] });
        }

        // 3. Soft delete (recommended)
        await user.destroy();

        // 4. Respond (204 for success)
        return res.json({ code: 0, message: msg["0"] });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: msg["500"] });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        // Check if user exists
        const { name, username, password, group_id, role } = req.body;
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.json({ code: 107, message: msg["107"] });
        }

        // const existingGroup = await UserGroup.findOne({ where: { group_code } });
        // if (!existingGroup) {
        //     return res.json({ code: 101, message: msg["101"], detail: `group_code ${group_code}` });
        // }
        const existingGroup = await UserGroup.findByPk(Number(group_id))
        if (!existingGroup) {
            return res.json({ code: 101, message: msg["101"], detail: `group_id ${group_id}` });
        }


        console.log("Creating user with data:", { name, username, password, group_id: group_id, group: existingGroup.id });

        // Create user
        const user = await User.create({
            name,
            username,
            password,
            group_id: existingGroup.id,
            role
        });


        // // Omit password from response
        const { password: _, ...userWithoutPassword } = user.toJSON();

        return res.status(200).json({
            code: 0,
            message: msg["0"],
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        // Check if user exists
        const username = req.user?.username

        // 2. Find user (with early return)
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ code: 101, message: msg["101"], detail: `username ${username}` });
        }

        const { current_password, new_password } = req.body;

        // 3. Verify password (with early return)
        const isMatch = await bcrypt.compare(current_password, user!.password);
        if (!isMatch) {
            return res.json({ // ✅ Return early
                code: 102,
                message: msg["102"],
                detail: "Wrong password"
            });
        }

        // 4. Update Password
        user.password = new_password;
        await user.save();

        // 5. Generate token
        const token = generateToken({
            id: user!.id,
            name: user!.name,
            username: user!.username,
        });


        return res
            .cookie('token', token, cookieOptions)
            .json({
                code: 0,
                message: msg["0"],
                data: {
                    id: user!.id,
                    name: user!.name,
                    username: user!.username,
                    token: token,
                }
            });


        return res.json({ msg: "Ok" })
        // const existingUser = await User.findOne({ where: { req.user?.username } });
        // if (existingUser) {
        //     return res.json({ code: 107, message: msg["107"] });
        // }

        // // const existingGroup = await UserGroup.findOne({ where: { group_code } });
        // // if (!existingGroup) {
        // //     return res.json({ code: 101, message: msg["101"], detail: `group_code ${group_code}` });
        // // }
        // const existingGroup = await UserGroup.findByPk(Number(group_id))
        // if (!existingGroup) {
        //     return res.json({ code: 101, message: msg["101"], detail: `group_id ${group_id}` });
        // }


        // console.log("Creating user with data:", { name, username, password, group_id: group_id, group: existingGroup.id });

        // // Create user
        // const user = await User.create({
        //     name,
        //     username,
        //     password,
        //     group_id: existingGroup.id,

        // });


        // // // Omit password from response
        // const { password: _, ...userWithoutPassword } = user.toJSON();

        // return res.status(200).json({
        //     code: 0,
        //     message: msg["0"],
        //     data: { user: userWithoutPassword }
        // });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

// export const register = async (req: Request, res: Response) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check if user already exists
//         const existingUser = await userService.findUserByEmail(email);
//         if (existingUser) {
//             return res.status(400).json({ message: 'Email already in use' });
//         }

//         // Create new user
//         const user = await userService.createUser({ name, email, password });


//         // Omit password from response
//         const { password: _, ...userWithoutPassword } = user.toJSON();

//         return res.status(200).json({
//             message: 'User registered successfully',
//             user: userWithoutPassword,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Error registering user' });
//     }

// };

// export const login = async (req: Request, res: Response) => {
//     try {
//         const { email, password } = req.body;

//         // 1. Validate input (with early return)
//         if (!email || !password) {
//             return res.status(400).json({ // ✅ Return early
//                 success: false,
//                 message: 'Please provide email and password'
//             });
//         }

//         // 2. Find user (with early return)
//         const user = await User.findOne({ where: { email } });
//         if (!user) {
//             return res.status(401).json({ // ✅ Return early
//                 success: false,
//                 message: 'Invalid credentials'
//             });
//         }

//         // 3. Verify password (with early return)
//         const isMatch = await bcrypt.compare(password, user!.password);
//         if (!isMatch) {
//             return res.status(401).json({ // ✅ Return early
//                 success: false,
//                 message: 'Invalid credentials'
//             });
//         }

//         // 4. Generate token
//         const token = generateToken({
//             id: user!.id,
//             name: user!.name,
//             email: user!.email,
//         });

//         // 5. Send SINGLE successful response
//         return res
//             .status(200)
//             // .cookie('token', token, cookieOptions)
//             .json({
//                 success: true,
//                 data: {
//                     id: user!.id,
//                     name: user!.name,
//                     email: user!.email
//                 },
//                 token
//             });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: 'Server error during login'
//         });
//     }
// };




export default {
    getAllUsers,
    updateUser,
    deleteUser,
    createUser,
    changePassword,
    test,
};



//     try {
//         const { name, email, password } = req.body;

//         // Check if user already exists
//         const existingUser = await userService.findUserByEmail(email);
//         if (existingUser) {
//             res.status(400).json({ message: 'Email already in use' });
//         }

//         // Create new user
//         const user = await userService.createUser({ name, email, password });

//         // Omit password from response
//         const { password: _, ...userWithoutPassword } = user.toJSON();

//         res.status(200).json({
//             message: 'User registered successfully',
//             user: userWithoutPassword,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error registering user' });
//     }
// };

// export const login = async (req: Request, res: Response) => {
//         try {
//             const { email, password } = req.body;

//             // 1. Validate input (with early return)
//             if (!email || !password) {
//                 return res.status(400).json({ // ✅ Return early
//                     success: false,
//                     message: 'Please provide email and password'
//                 });
//             }

//             // 2. Find user (with early return)
//             const user = await User.findOne({ where: { email } });
//             if (!user) {
//                 return res.status(401).json({ // ✅ Return early
//                     success: false,
//                     message: 'Invalid credentials'
//                 });
//             }

//             // 3. Verify password (with early return)
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) {
//                 return res.status(401).json({ // ✅ Return early
//                     success: false,
//                     message: 'Invalid credentials'
//                 });
//             }

//             // 4. Generate token
//             const token = generateToken({
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//             });

//             // 5. Send SINGLE successful response
//             return res
//                 .status(200)
//                 .cookie('token', token, cookieOptions)
//                 .json({
//                     success: true,
//                     data: {
//                         id: user.id,
//                         name: user.name,
//                         email: user.email
//                     },
//                     token
//                 });

//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({
//                 success: false,
//                 message: 'Server error during login'
//             });
//         }
//     };


// export default {
//     register,
//     login
// };