import mongoose from 'mongoose';
import PostModel from '../posts/PostModel.js';
import UserModel from '../auth/UserModel.js';
import CommentModel from '../posts/CommentModel.js';
import NotificationModel from '../notifications/NotificationModel.js';

class DatabaseCleanup {
    async validateDatabase() {
        // Проверяем подключение к правильной базе данных
        const dbName = mongoose.connection.db.databaseName;
        if (dbName !== 'final-project_data') {
            throw new Error(`Wrong database connected: ${dbName}. Expected: final-project_data`);
        }

        // Проверяем наличие данных
        const usersCount = await UserModel.countDocuments();
        const postsCount = await PostModel.countDocuments();

        console.log('Current database state:');
        console.log(`- Total users: ${usersCount}`);
        console.log(`- Total posts: ${postsCount}`);

        if (usersCount === 0) {
            throw new Error('Database validation failed: No users found');
        }
    }

    async findOrphanedPosts() {
        const orphanedPosts = [];
        const allPosts = await PostModel.find({});
        
        for (const post of allPosts) {
            const authorExists = await UserModel.exists({ _id: post.author });
            if (!authorExists) {
                orphanedPosts.push({
                    id: post._id,
                    title: post.title,
                    authorId: post.author
                });
            }
        }

        return orphanedPosts;
    }

    async cleanOrphanedData() {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Сначала проверяем базу данных
            await this.validateDatabase();

            console.log('\nStarting safe database cleanup...');
            
            // Находим "осиротевшие" посты без удаления
            const orphanedPosts = await this.findOrphanedPosts();
            console.log(`\nFound ${orphanedPosts.length} orphaned posts:`);
            orphanedPosts.forEach(post => {
                console.log(`- Post "${post.title}" (ID: ${post.id}) from deleted user ${post.authorId}`);
            });

            if (orphanedPosts.length === 0) {
                console.log('No orphaned posts found. Database is clean.');
                await session.abortTransaction();
                return {
                    postsDeleted: 0,
                    commentsDeleted: 0,
                    notificationsDeleted: 0
                };
            }

            const orphanedPostIds = orphanedPosts.map(post => post.id);

            // Удаляем комментарии к постам
            const commentsDeleted = await CommentModel.deleteMany({
                post: { $in: orphanedPostIds }
            }).session(session);
            console.log(`Deleted ${commentsDeleted.deletedCount} comments`);

            // Удаляем уведомления
            const notificationsDeleted = await NotificationModel.deleteMany({
                post: { $in: orphanedPostIds }
            }).session(session);
            console.log(`Deleted ${notificationsDeleted.deletedCount} notifications`);

            // Удаляем каждый пост по отдельности
            let successfullyDeletedPosts = 0;
            for (const post of orphanedPosts) {
                try {
                    await PostModel.findByIdAndDelete(post.id).session(session);
                    console.log(`Successfully deleted post "${post.title}" (ID: ${post.id})`);
                    successfullyDeletedPosts++;
                } catch (error) {
                    console.error(`Failed to delete post ${post.id}:`, error.message);
                }
            }

            // Проверяем, все ли посты удалены
            const remainingPosts = await PostModel.countDocuments({
                _id: { $in: orphanedPostIds }
            }).session(session);

            if (remainingPosts > 0) {
                console.warn(`Warning: ${remainingPosts} posts could not be deleted`);
            }

            // Если хотя бы некоторые посты были удалены успешно, коммитим транзакцию
            if (successfullyDeletedPosts > 0) {
                await session.commitTransaction();
                console.log('\nCleanup completed successfully!');
                return {
                    postsDeleted: successfullyDeletedPosts,
                    commentsDeleted: commentsDeleted.deletedCount,
                    notificationsDeleted: notificationsDeleted.deletedCount
                };
            } else {
                throw new Error('No posts were deleted successfully');
            }

        } catch (error) {
            console.error('\nError during cleanup:', error.message);
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async runCleanup() {
        try {
            console.log('Starting cleanup process...');
            
            const results = await this.cleanOrphanedData();
            
            console.log('\nCleanup results:', {
                postsDeleted: results.postsDeleted,
                commentsDeleted: results.commentsDeleted,
                notificationsDeleted: results.notificationsDeleted
            });
            
            return results;
        } catch (error) {
            console.error('\nCleanup failed:', error.message);
            throw error;
        }
    }
}

export default new DatabaseCleanup();