import { MaterialType, MaterialUnit } from '../constants/enum.data';
import jwt from 'jsonwebtoken'
import config from '../config/config';


function isValidMaterialType(data: string): boolean {
    return Object.values(MaterialType).includes(data as MaterialType);
}

function isValidMaterialUnit(data: string): boolean {
    return Object.values(MaterialUnit).includes(data as MaterialUnit);
}

// Type definitions
interface UserPayload {
    id: number;
    name: string;
    username: string;
}

const generateToken = (user: UserPayload): string => {
    const payload = {
        id: user.id,
        username: user.username
    };

    console.log('JWT Secret:', config.JWT.SECRET);
    console.log('JWT Expires:', config.JWT.EXPIRES);

    return jwt.sign(
        payload,
        config.JWT.SECRET,
        { expiresIn: '30d' }
        // { expiresIn: (config.JWT.EXPIRES).toString }
        // config.JWT.EXPIRES
        // // { expiresIn: config.JWT.EXPIRES }
        // {
        //     expiresIn: config.JWT.EXPIRES,
        //     algorithm: 'HS256'
        // }
    );
};

const cookieOptions = {
    expires: new Date(
        Date.now() + config.JWT.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
};

export { isValidMaterialType, isValidMaterialUnit, generateToken, cookieOptions }