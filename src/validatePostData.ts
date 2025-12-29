// import { Request, Response, NextFunction } from 'express';

// // Validation function
// function validatePostData(req: Request, res: Response, next: NextFunction) {
//   const requiredKeys = ['username', 'email', 'password'];

//   for (const key of requiredKeys) {
//     if (!req.body[key]) {
//       res.status(400).json({
//         code: 400,
//         message: `Missing required field: ${key}`,
//       });
//     }
//   }

//   next(); // Proceed to the next middleware/route handler
// }

import { Request, Response, NextFunction } from 'express';
import msg from './constants/msg.json'


// Centralize validation function
export function validatePostData(requiredKeys: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const key of requiredKeys) {
      if (!req.body[key]) {
        return res.status(401).json({
          code: 105,
          message: msg["105"],
          detail: `Need key: ${key}`
        });
      }
    }

    next(); // If validation passes, move to the next middleware or route handler
  };
}

export default validatePostData;