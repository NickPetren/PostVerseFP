import UserService from './UserService.js';
import jwt from 'jsonwebtoken';
import UserModel from './UserModel.js';
import NotificationService from '../notifications/NotificationService.js';

class UserController {
    async register(req, res) {
        try {
            const user = await UserService.register(req.body);
            const token = jwt.sign(
                { userId: user._id },
                'your-secret-key-123',
                { expiresIn: '100d' }
            );

            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const user = await UserService.login(req.body);
            const token = jwt.sign(
                { userId: user._id },
                'your-secret-key-123',
                { expiresIn: '100d' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await UserService.getProfile(req.userId);
            res.json({
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteAccount(req, res) {
        try {
            const userId = req.userId;
            await UserService.deleteAccount(userId);
            res.json({ 
                success: true, 
                message: 'Account successfully deleted' 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await UserModel.find({});
            const userData = users.map(user => ({
                email: user.email,
                username: user.username,
                displayName: user.displayName
            }));

            res.json({
                message: 'User data retrieved',
                users: userData
            });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async toggleFollow(req, res) {
        try {
            const userToFollowId = req.params.userId;
            const currentUserId = req.userId;
    
            if (userToFollowId === currentUserId) {
                return res.status(400).json({ message: "You can't follow yourself" });
            }
    
            const [userToFollow, currentUser] = await Promise.all([
                UserModel.findById(userToFollowId),
                UserModel.findById(currentUserId)
            ]);
    
            if (!userToFollow || !currentUser) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const isFollowing = userToFollow.followers.includes(currentUserId);
    
            if (isFollowing) {
                userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
                currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollowId);
            } else {
                userToFollow.followers.push(currentUserId);
                currentUser.following.push(userToFollowId);

                await NotificationService.createFollowNotification(currentUserId, userToFollowId);
            }
    
            await Promise.all([userToFollow.save(), currentUser.save()]);
    
            res.json({
                isFollowing: !isFollowing,
                followersCount: userToFollow.followers.length,
                followingCount: userToFollow.following.length
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserProfile(req, res) {
        try {
            const user = await UserModel.findById(req.params.userId)
                .select('-password')
                .populate('followers', 'username displayName avatar')
                .populate('following', 'username displayName avatar');
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const isFollowing = user.followers.some(
                follower => follower._id.toString() === req.userId
            );
    
            res.json({
                success: true,
                user: {
                    ...user.toObject(),
                    isFollowing,
                    followersCount: user.followers.length,
                    followingCount: user.following.length
                }
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.userId;
            const { email, username, displayName, avatar } = req.body;

            const existingUser = await UserService.findByEmailOrUsername(email, username, userId);
            if (existingUser) {
                throw new Error(
                    existingUser.email === email 
                        ? 'Email already exists' 
                        : 'Username already exists'
                );
            }

            const updatedUser = await UserService.updateProfile(userId, {
                email,
                username,
                displayName,
                avatar
            });

            res.json({
                success: true,
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    displayName: updatedUser.displayName,
                    username: updatedUser.username,
                    avatar: updatedUser.avatar
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getFollowers(req, res) {
        try {
            const userId = req.params.userId;
            const user = await UserModel.findById(userId)
                .populate('followers', 'username displayName avatar');
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.json({ 
                success: true, 
                followers: user.followers 
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    async getFollowing(req, res) {
        try {
            const userId = req.params.userId;
            const user = await UserModel.findById(userId)
                .populate('following', 'username displayName avatar');
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.json({ 
                success: true, 
                following: user.following 
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new UserController();