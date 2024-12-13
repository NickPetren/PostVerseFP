import { Router } from 'express';
import PostController from './PostController.js';
import { authMiddleware } from '../auth/authMiddleware.js';

const router = Router();

// Убедитесь, что этот маршрут есть и идет первым в списке
router.get('/', authMiddleware, PostController.getAll);

router.use((req, res, next) => {
    console.log('Posts Router:', req.method, req.url);
    next();
});

router.post('/', authMiddleware, PostController.create);

router.get('/user/:userId', authMiddleware, PostController.getUserPosts);

router.get('/tag/:tagName', authMiddleware, PostController.getByTag);

console.log('PostController:', PostController);


router.get('/', authMiddleware, PostController.getAll);
router.post('/:postId/like', authMiddleware, PostController.toggleLike);
router.get('/user/:userId', authMiddleware, PostController.getUserPosts);

router.get('/:postId', authMiddleware, PostController.getOne);

router.post('/:postId/comments', authMiddleware, PostController.addComment);
router.get('/:postId/comments', authMiddleware, PostController.getComments);

router.put('/:postId', authMiddleware, PostController.updatePost);
router.delete('/:postId', authMiddleware, PostController.deletePost);

export default router;
