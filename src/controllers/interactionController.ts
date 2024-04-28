import { Request, Response } from 'express';
import { AuthenticatedRequest} from '../middlewares/auth';
import Interaction from '../models/interaction.model';
import User from '../models/user.model';
import Post from '../models/post.model';

export const upVote = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const userId = (req as AuthenticatedRequest).userId;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already interacted with the post
        const interaction = await Interaction.findOne({ user: userId, post: postId });

        // If interaction exists, check if the upvote and downvote fields are still in the default state
        if (interaction) {
            if (interaction.upvoted === false && interaction.downvoted === false) {
                // Update the interaction
                interaction.upvoted = true;
                await interaction.save();

                // Increase upvote count by 1
                post.upvoteCount += 1;
                await post.save();

                return res.json({ message: 'Post upvoted successfully', interaction });
            } else if (interaction.downvoted === true) {
                // If the downvote field is true, switch to upvote
                interaction.downvoted = false;
                interaction.upvoted = true;
                await interaction.save();

                // Increase upvote count by 1 and decrease downvote count by 1
                post.upvoteCount += 1;
                post.downvoteCount -= 1;
                await post.save();

                return res.json({ message: 'Post upvoted successfully', interaction });
            } else {
                return res.status(400).json({ message: 'You have already upvoted this post' });
            }
        }

        // Create a new interaction if it doesn't exist
        const newInteraction = new Interaction({ user: userId, post: postId, upvoted: true, downvoted: false });
        await newInteraction.save();

        // Increase upvote count by 1
        post.upvoteCount += 1;
        await post.save();

        res.json({ message: 'Post upvoted successfully', interaction: newInteraction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const downVote = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const userId = (req as AuthenticatedRequest).userId;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already interacted with the post
        const interaction = await Interaction.findOne({ user: userId, post: postId });

        // If interaction exists, check if the upvote and downvote fields are still in the default state
        if (interaction) {
            if (interaction.upvoted === false && interaction.downvoted === false) {
                // Update the interaction
                interaction.downvoted = true;
                await interaction.save();

                // Increase downvote count by 1
                post.downvoteCount += 1;
                await post.save();

                return res.json({ message: 'Post downvoted successfully', interaction });
            } else if (interaction.upvoted === true) {
                // If the upvote field is true, switch to downvote
                interaction.upvoted = false;
                interaction.downvoted = true;
                await interaction.save();

                // Increase downvote count by 1 and decrease upvote count by 1
                post.downvoteCount += 1;
                post.upvoteCount -= 1;
                await post.save();

                return res.json({ message: 'Post downvoted successfully', interaction });
            } else {
                return res.status(400).json({ message: 'You have already downvoted this post' });
            }
        }

        // Create a new interaction if it doesn't exist
        const newInteraction = new Interaction({ user: userId, post: postId, upvoted: false, downvoted: true });
        await newInteraction.save();

        // Increase downvote count by 1
        post.downvoteCount += 1;
        await post.save();

        res.json({ message: 'Post downvoted successfully', interaction: newInteraction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



export const comment = async (req: Request, res: Response) => {
    try {
        const { comment } = req.body;
        const postId = req.params.postId;
        const userId = (req as AuthenticatedRequest).userId;

        // Find existing interaction for the user and post
        let interaction = await Interaction.findOne({ user: userId, post: postId });

        // If interaction exists, update it; otherwise, create a new one
        if (interaction) {
            // Check if the interaction already has a comment
            if (interaction.comment) {
                // If the interaction already has a comment, create a new interaction
                interaction = new Interaction({ user: userId, post: postId, comment });
            } else {
                // If the interaction doesn't have a comment, update it
                interaction.comment = comment;
            }
        } else {
            // If no interaction exists, create a new one
            interaction = new Interaction({ user: userId, post: postId, comment });
        }

        await interaction.save();

        res.status(201).json(interaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const replyComment = async (req: Request, res: Response) => {
    try {
        const { comment } = req.body;
        const commentId = req.params.commentId;
        const userId = (req as AuthenticatedRequest).userId;

        const interaction = await Interaction.findById(commentId);
        if (!interaction) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Initialize replies array if it's undefined
        if (!interaction.replies) {
            interaction.replies = [];
        }

        // Add the reply to the comment
        interaction.replies.push({ user: userId, comment: comment, createdAt: new Date() });
        await interaction.save();

        res.status(201).json(interaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// API endpoint to retrieve comments for a specific post
export const getPostComments = async (req: Request, res: Response) => {
    try {
        // Extract post ID from request parameters
        const postId = req.params.postId;

        // Query database for comments associated with the specified post
        const comments = await Interaction.find({ post: postId }).exec();

        // If no comments found, return an empty array
        if (!comments) {
            return res.status(404).json({ message: 'No comments found for this post' });
        }

        // Fetch user information for each comment author
        const commentsWithUserInfo = await Promise.all(comments.map(async (comment) => {
            // Fetch user information for the comment author
            const user = await User.findById(comment.user);

            // If user is null, return null
            if (!user) {
                return null;
            }

            // Format comment with user information
            return {
                user: {
                    name: user.name,
                    picture: user.picture,
                },
                comment: comment.comment,
                createdAt: comment.createdAt
            };
        }));

        // Filter out null values from the comments
        const filteredComments = commentsWithUserInfo.filter(comment => comment !== null);

        // Return the formatted comments in the API response
        res.json(filteredComments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};