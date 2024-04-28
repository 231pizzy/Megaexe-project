import { Request, Response } from 'express';
import { AuthenticatedRequest} from '../middlewares/auth';
import Post from '../models/post.model';
import Interaction from '../models/interaction.model';


export const createPost = async (req: Request, res: Response) => {
    try {
        const { image, content, category } = req.body;
        const userId = (req as AuthenticatedRequest).userId;

        // Create a new post
        const newPost = await Post.create({
            image,
            content,
            category,
            user: userId,
        });

        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to edit a post
export const editPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.postId;
        const userId = (req as AuthenticatedRequest).userId;
      
        const { image, content, category } = req.body;

        // Find the post by ID
        let post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        // Check if the authenticated user is authorized to edit the post
        if (post.user.toString() !== userId) {
            res.status(403).json({ error: 'Unauthorized: You do not have permission to perform this action now' });
            return;
        }

        // Iterate over each field and update the post if provided
        if (image !== undefined) {
            post.image = image;
        }
        if (content !== undefined) {
            post.content = content;
        }
        if (category !== undefined) {
            post.category = category;
        }

        // Save the updated post
        await post.save();

        res.json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.postId;

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        // Delete all interactions related to the post
        await Interaction.deleteMany({ post: postId });

        // Delete the post
        await Post.deleteOne({ _id: postId });

        res.json({ message: 'Post and associated interactions deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

