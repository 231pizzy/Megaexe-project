import { Router } from "express";
import { authenticateUser, authorizeUser} from "../middlewares/auth";
import { createPost, deletePost, editPost} from "../controllers/postController";


const router = Router();

router.post('/create-post', authenticateUser, createPost)
router.put('/edit-post/:postId',authenticateUser, authorizeUser, editPost);
router.delete('/delete-post/:postId',authenticateUser, authorizeUser, deletePost)

export default router;