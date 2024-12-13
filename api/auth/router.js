import { Router } from 'express';
import UserController from './UserController.js';
import { authMiddleware } from './authMiddleware.js';
import UserModel from './UserModel.js';
import mongoose from 'mongoose';

const router = Router();

// Публичные маршруты
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Защищенные маршруты
router.get('/profile', authMiddleware, UserController.getProfile);
router.delete('/delete', authMiddleware, UserController.deleteAccount);

router.put('/profile', authMiddleware, UserController.updateProfile);

router.get('/debug/users', UserController.getAllUsers);

router.get('/user/:userId', authMiddleware, UserController.getUserProfile);

router.post('/user/:userId/follow', authMiddleware, UserController.toggleFollow);

// Новые маршруты для подписчиков и подписок
router.get('/user/:userId/followers', authMiddleware, UserController.getFollowers);
router.get('/user/:userId/following', authMiddleware, UserController.getFollowing);

router.get('/suggested-users', authMiddleware, async (req, res) => {
    try {
        const currentUser = await UserModel.findById(req.userId);
        
        const suggestedUsers = await UserModel.aggregate([
            {
                $match: {
                    _id: { 
                        $nin: [
                            new mongoose.Types.ObjectId(req.userId),
                            ...(currentUser.following.map(id => new mongoose.Types.ObjectId(id)))
                        ]
                    }
                }
            },
            { $sample: { size: 5 } },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    displayName: 1,
                    avatar: 1
                }
            }
        ]);

        res.json(suggestedUsers);
    } catch (error) {
        console.error('Error getting suggested users:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;