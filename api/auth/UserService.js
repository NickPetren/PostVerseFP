/*version update 1*/

import UserModel from './UserModel.js';
import PostModel from '../posts/PostModel.js';
import NotificationModel from '../notifications/NotificationModel.js';
import CommentModel from '../posts/CommentModel.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

class UserService {
    async register({ email, password, displayName, username, avatar }) {
        const existingUser = await UserModel.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            throw new Error(
                existingUser.email === email 
                    ? 'Email already exists' 
                    : 'Username already exists'
            );
        }

        return await UserModel.create({
            email,
            password,
            displayName,
            username,
            avatar
        });
    }

    async login({ email, password }) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }
        
        return user;
    }

    async getProfile(userId) {
        const user = await UserModel.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async findByEmailOrUsername(email, username, excludeUserId) {
        return await UserModel.findOne({
            $and: [
                { _id: { $ne: excludeUserId } },
                { $or: [
                    { email: email },
                    { username: username }
                ]}
            ]
        });
    }

    async updateProfile(userId, updateData) {
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async deleteAccount(userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Находим пользователя и проверяем его существование
            const user = await UserModel.findById(userId).session(session);
            if (!user) {
                throw new Error('User not found');
            }

            // 2. Находим все посты пользователя
            const userPosts = await PostModel.find({ author: userId }).session(session);
            const postIds = userPosts.map(post => post._id);

            // 3. Безопасно удаляем комментарии
            // Сначала удаляем комментарии к постам пользователя
            await CommentModel.deleteMany({
                post: { $in: postIds }
            }).session(session);
            
            // Затем удаляем комментарии, оставленные пользователем
            await CommentModel.deleteMany({
                author: userId
            }).session(session);

            // 4. Удаляем уведомления
            await NotificationModel.deleteMany({
                $or: [
                    { recipient: userId },
                    { sender: userId }
                ]
            }).session(session);

            // 5. Обновляем списки подписчиков и подписок
            await UserModel.updateMany(
                { 
                    $or: [
                        { followers: userId },
                        { following: userId }
                    ]
                },
                { 
                    $pull: { 
                        followers: userId,
                        following: userId 
                    }
                }
            ).session(session);

            // 6. Удаляем лайки пользователя с постов
            await PostModel.updateMany(
                { likes: userId },
                { $pull: { likes: userId } }
            ).session(session);

            // 7. Удаляем все посты пользователя
            await PostModel.deleteMany({
                _id: { $in: postIds }
            }).session(session);

            // 8. Наконец, удаляем самого пользователя
            await UserModel.findByIdAndDelete(userId).session(session);

            // Если всё прошло успешно, фиксируем транзакцию
            await session.commitTransaction();
            return true;

        } catch (error) {
            // В случае ошибки откатываем все изменения
            await session.abortTransaction();
            console.error('Error deleting user account:', error);
            throw error;
        } finally {
            // Завершаем сессию
            session.endSession();
        }
    }
}

export default new UserService();