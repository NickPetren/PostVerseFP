import { Router } from 'express';
import { authMiddleware } from './auth/authMiddleware.js';
import UserModel from './auth/UserModel.js';
import PostModel from './posts/PostModel.js';

const router = Router();

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json({ users: [] });
        }

        const users = await UserModel.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { displayName: { $regex: query, $options: 'i' } }
            ]
        }).select('username displayName avatar');

        const currentUser = await UserModel.findById(req.userId);
        const usersWithFollowStatus = users.map(user => ({
            ...user.toObject(),
            isFollowing: currentUser.following.includes(user._id)
        }));

        res.json(usersWithFollowStatus);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/posts', authMiddleware, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json({ posts: [] });
        }

        const posts = await PostModel.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { text: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('author', 'username displayName avatar')
        .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Search posts error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;