import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Post  from '../models/post.model';

// Define a new interface to extend the Request interface
export interface AuthenticatedRequest extends Request {
    userId: string; 
}

// Middleware to authenticate user using JWT
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication failed: Token missing' });
        }

        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
     
        if (!decodedToken.userId) {
            throw new Error('Authentication failed: User ID not found in token');
        }

        (req as AuthenticatedRequest).userId = decodedToken.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed: Invalid token' });
    }
};

// Middleware to authorize user to edit or delete post
export const authorizeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.postId; // Assuming postId is passed in the request params

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }


        // Check if the authenticated user is the owner of the post
        if (post.user.toString() !== (req as AuthenticatedRequest).userId) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission to perform this action' });
        }
        next();
    } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};