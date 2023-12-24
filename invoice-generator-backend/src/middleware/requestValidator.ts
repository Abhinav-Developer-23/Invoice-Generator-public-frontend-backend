import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import  jwt  from 'jsonwebtoken';
import { User } from '../types/user';

// Define a Zod schema for the request parameters
const signupRequestSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  role:z.enum(['ADMIN','USER'])
});

// Extend the Request type to include a custom property 'validatedData'
interface ValidatedRequest extends Request {
  validatedData?: {
    username: string;
    email: string;
    password: string;
    role:'USER'|'ADMIN';
  };
}

const validateSignupRequest = (
  req: ValidatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request parameters against the Zod schema

    const validatedData = signupRequestSchema.parse(req.body);
   
       req.validatedData = validatedData;
    

    // Continue to the next middleware
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      res.status(400).json({ error: 'Invalid request parameters', details: error.errors });
    } else {
      // Handle other errors
      next(error);
    }
  }
};

export { validateSignupRequest };

interface CustomRequest extends Request {
  user?: User; // Change 'any' to the type you expect for the user property
}
export const authenticate = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const secretKey=process.env.JWT_KEY!;
    const decoded = jwt.verify(token, secretKey); // Replace 'your-secret-key' with your actual secret key

    req.user=decoded as User;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};