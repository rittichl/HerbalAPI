import { NextFunction, Request, Response } from 'express'
import User from '../models/user.model';
import UserGroup from '../models/user_group.model';
import MenuPermission from '../models/menu.permission.model';
import MenuItem from '../models/menu.item.model';
import jwt, { JwtPayload } from 'jsonwebtoken'
import msg from '../constants/msg.json'
import config from '../config/config';
import bcrypt from 'bcrypt';
import { cookieOptions, generateToken } from '../utility/util.function';
import Logger from '../middleware/logger';



declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        token: string;
      };
    }
  }
}

// // Type definitions
// interface UserPayload {
//   id: number;
//   name: string;
//   username: string;
// }

// Token generation utility
// const generateToken = (user: UserPayload): string => {
//   const payload = {
//     id: user.id,
//     username: user.username
//   };

//   console.log('JWT Secret:', config.JWT.SECRET);
//   console.log('JWT Expires:', config.JWT.EXPIRES);

//   return jwt.sign(
//     payload,
//     config.JWT.SECRET,
//     { expiresIn: '30d' }
//     // { expiresIn: (config.JWT.EXPIRES).toString }
//     // config.JWT.EXPIRES
//     // // { expiresIn: config.JWT.EXPIRES }
//     // {
//     //     expiresIn: config.JWT.EXPIRES,
//     //     algorithm: 'HS256'
//     // }
//   );
// };





export async function chkApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('api-key')
  if (!apiKey || apiKey != config.APIKEY) return res.status(401).json({ code: 106, message: msg["106"] })
  next()
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    // console.log('Header ', req.headers)

    // console.log(req.headers['cookie']);
    // const tokenCookie = req.headers['cookie']
    // if (!tokenCookie) return res.status(401).json({ code: 103, message: msg["103"] })


    // const token = tokenCookie.replace("token=", '');

    const token = req.header('Authorization')?.replace('Bearer ', '')
    // console.log('Token: ', token)
    if (!token) {
      Logger.warn('Authentication failed: No token provided', req);
      return res.status(401).json({ code: 103, message: msg["103"] })
    }

    const apiKey = req.header('api-key')
    // console.log("apiKey: ", apiKey)
    // console.log("config.APIKEY: ", config.APIKEY)
    if (!apiKey || apiKey != config.APIKEY) {
      Logger.warn('Authentication failed: Invalid API key', req, null, { providedApiKey: apiKey });
      return res.status(401).json({ code: 106, message: msg["106"] })
    }

    const verified = jwt.verify(token!, config.JWT.SECRET) as JwtPayload
    // console.log('Verified: ', verified)
    if (!verified) {
      Logger.warn('Authentication failed: Token verification failed', req);
      return res.status(401).json({ code: 104, message: msg["104"] })
    }
    if (!verified.username) {
      Logger.warn('Authentication failed: No username in token', req);
      return res.status(401).json({ code: 104, message: msg["104"] })
    }

    // console.log('Username: ', verified.username)

    // req.body.username = verified.username
    // req.body.token = token
    req.user = { id: verified.id, username: verified.username, token: token as string };

    Logger.info('Authentication successful', req, null, { userId: verified.id, username: verified.username });

    next()
  } catch (error: any) {
    Logger.error('Authentication error', req, null, error);
    return res.status(500).json({ error: error.message })
  }
}

export async function checkApikey(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.header('api-key')
    // console.log("apiKey: ", apiKey)
    // console.log("config.APIKEY: ", config.APIKEY)
    if (!apiKey || apiKey != config.APIKEY) return res.status(401).json({ code: 106, message: msg["106"] })

    next()
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}


export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user!.username !== 'admin') return res.status(200).json({ code: 109, message: msg["109"] }).end();
  next();
};



export const authenController = {
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // 2. Find user with group (with early return)
      const user = await User.findOne({ 
        where: { username },
        include: [{
          model: UserGroup,
          as: 'group',
          attributes: ['id', 'group_code', 'group_name']
        }]
      });
      if (!user) {
        return res.status(401).json({ code: 101, message: msg["101"], detail: `username ${username}` });
      }

      // 3. Verify password (with early return)
      const isMatch = await bcrypt.compare(password, user!.password);
      if (!isMatch) {
        return res.json({ // ✅ Return early
          code: 102,
          message: msg["102"],
          detail: "Wrong password"
        });
      }

      // 4. Generate token
      const token = generateToken({
        id: user!.id,
        name: user!.name,
        username: user!.username,
      });

      // 5. Fetch menu permissions for the user's group
      const menuPermissions = await MenuPermission.findAll({
        where: { user_group_id: user!.group_id },
        include: [{
          model: MenuItem,
          as: 'menuItem',
          attributes: ['id', 'menu_name', 'resource_name']
        }],
        attributes: ['view', 'add', 'edit', 'delete']
      });

      // 6. Format menu items with permissions (filter out any null menuItems)
      const menuItems = menuPermissions
        .filter(permission => permission.menuItem) // Filter out any permissions without menu items
        .map(permission => ({
          id: permission.menuItem!.id,
          menu_name: permission.menuItem!.menu_name,
          resource_name: permission.menuItem!.resource_name,
          view: permission.view,
          add: permission.add,
          edit: permission.edit,
          delete: permission.delete
        }));

      // 7. Format user group data
      const userGroup = user.group ? {
        id: user.group.id,
        group_code: user.group.group_code,
        group_name: user.group.group_name
      } : null;

      // 8. Send SINGLE successful response
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
            userGroup: userGroup,
            menuItem: menuItems
          }
        });



    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  },


  logout: async (req: Request, res: Response) => {
    res.clearCookie('token');
    return res.json({ code: 0, message: msg['0'] });
  }

}


