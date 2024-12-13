import PostDataAccess from './DataAccess.js';

class PostService {
   async getAll(skip = 0, limit = 10) {
       try {
           const posts = await PostDataAccess.getAll(skip, limit);
           return posts.map(post => ({
               ...post.toObject(),
               likes: post.likes || []
           }));
       } catch (error) {
           console.error('Service error:', error);
           return [];
       }
   }

   async create(postData) {
       try {
           console.log('Service received post data:', postData);
           if (postData.images && Array.isArray(postData.images)) {
               console.log('Processing images...');
               postData.images = postData.images.filter(img => img && img.startsWith('data:image/'));
               console.log('Processed images count:', postData.images.length);
           }
           
           console.log('Sending to DataAccess:', postData);
           return await PostDataAccess.create(postData);
       } catch (error) {
           console.error('Service error creating post:', error);
           throw error;
       }
   }

   async getUserPosts(userId) {
        try {
            console.log('Getting posts for user in service:', userId);
            const posts = await PostModel.find({ author: userId })
                .populate('author', 'username displayName avatar')
                .sort({ createdAt: -1 });
    
            return posts.map(post => ({
                ...post.toObject(),
                author: post.author || {
                    username: 'anonymous',
                    displayName: 'Anonymous',
                    avatar: null
                },
                likes: post.likes || []
            }));
        } catch (error) {
            console.error('Service error getting user posts:', error);
            throw error;
        }
    }

   async findById(postId) {
       try {
           const post = await PostDataAccess.findById(postId);
           console.log('Found post in service:', post);
           return post;
       } catch (error) {
           console.error('Service error finding post:', error);
           throw error;
       }
   }

   async toggleLike(postId, userId) {
       try {
           const post = await this.findById(postId);
           if (!post) {
               throw new Error('Post not found');
           }

           if (!post.likes) {
               post.likes = [];
           }

           const userLikeIndex = post.likes.findIndex(
               id => id.toString() === userId.toString()
           );

           if (userLikeIndex === -1) {
               post.likes.push(userId);
           } else {
               post.likes.splice(userLikeIndex, 1);
           }

           const updatedPost = await PostDataAccess.update(post);
           return updatedPost;
       } catch (error) {
           console.error('Toggle like error:', error);
           throw error;
       }
   }

   async updatePost(postId, updateData) {
       try {
           if (updateData.images && Array.isArray(updateData.images)) {
               updateData.images = updateData.images.filter(img => img && img.startsWith('data:image/'));
           }
           const updatedPost = await PostDataAccess.updatePost(postId, updateData);
           return updatedPost;
       } catch (error) {
           console.error('Service error updating post:', error);
           throw error;
       }
   }
   
   async deletePost(postId) {
       await PostDataAccess.deletePost(postId);
   }

   async getByTag(tag, skip = 0, limit = 10) {
        try {
            const posts = await PostModel.find({ tags: tag })
                .populate('author', 'username displayName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
    
            return posts.map(post => ({
                ...post.toObject(),
                likes: post.likes || []
            }));
        } catch (error) {
            console.error('Service error getting posts by tag:', error);
            return [];
        }
    }
}

export default new PostService();