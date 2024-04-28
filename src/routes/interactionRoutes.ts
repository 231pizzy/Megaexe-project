import { Router } from "express";
import { authenticateUser, authorizeUser} from "../middlewares/auth";
import { comment, downVote, getPostComments, replyComment, upVote } from "../controllers/interactionController";


const router = Router();

router.post('/like/:postId', authenticateUser, upVote)
router.post('/dislike/:postId',authenticateUser, downVote);
router.post('/comment/:postId', authenticateUser, comment)
router.post('/reply-comment/:commentId',authenticateUser, replyComment);
router.get('/get-comments/:postId',authenticateUser, getPostComments);

export default router;