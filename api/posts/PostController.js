import PostService from './Service.js';
import CommentService from './CommentService.js';
import NotificationService from '../notifications/NotificationService.js';
import UserModel from '../auth/UserModel.js';
import PostModel from './PostModel.js';
import CommentModel from './CommentModel.js';
import NotificationModel from '../notifications/NotificationModel.js';
import sharp from 'sharp';

const processImages = async (images) => {
   if (!images || !Array.isArray(images)) return [];
   
   return Promise.all(images.map(async (imageData) => {
       if (!imageData.startsWith('data:image/')) {
           throw new Error('Invalid image format');
       }

       const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
       const imageBuffer = Buffer.from(base64Data, 'base64');

       const processedBuffer = await sharp(imageBuffer)
           .resize(800, null, {
               withoutEnlargement: true,
               fit: 'inside'
           })
           .jpeg({ quality: 80 })
           .toBuffer();

       return `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
   }));
};

class PostController {
    async getAll(req, res) {
        try {
            console.log('Getting all posts');
            const posts = await PostModel.find()
                .populate({
                    path: 'author',
                    select: 'username displayName avatar'
                })
                .sort({ createdAt: -1 });
    
            console.log('Found posts:', posts);
    
            return res.json({
                posts: posts || []
            });
        } catch (error) {
            console.error('Error in getAll:', error);
            res.status(500).json({ 
                message: 'Failed to fetch posts',
                error: error.message
            });
        }
    }

   async create(req, res) {
       try {
           console.log('Received create post request:', {
               ...req.body,
               images: req.body.images ? `${req.body.images.length} images` : 'no images'
           });

           let postData = {
               ...req.body,
               author: req.userId
           };

           if (postData.tags) {
               postData.tags = postData.tags.map(tag => 
                   tag.replace(/\s+/g, '_')
               );
           }

           if (postData.images && postData.images.length > 0) {
               console.log('Processing images...');
               postData.images = await processImages(postData.images);
               console.log('Images processed successfully');
           }

           const post = await PostService.create(postData);
           console.log('Created post:', {
               ...post,
               images: post.images ? `${post.images.length} images` : 'no images'
           });
           
           const author = await UserModel.findById(req.userId);
           if (author.followers.length > 0) {
               await NotificationService.createNewPostNotification(
                   req.userId,
                   post._id,
                   author.followers
               );
           }
           
           res.status(201).json(post);
       } catch (error) {
           console.error('Error creating post:', error);
           res.status(400).json({ 
               message: error.message,
               details: error.stack
           });
       }
   }
   
   async getUserPosts(req, res) {
        try {
            const userId = req.params.userId;
            const posts = await PostModel.find({ author: userId })
                .populate('author', 'username displayName avatar')
                .sort({ createdAt: -1 });
                
            return res.json({
                posts: posts || []
            });
        } catch (error) {
            console.error('Error getting user posts:', error);
            res.status(500).json({ 
                message: 'Failed to fetch user posts',
                error: error.message
            });
        }
    }    

    async getByTag(req, res) {
        try {
            const tag = req.params.tagName.toLowerCase();
            
            const posts = await PostModel.find({ 
                tags: { $in: [tag] }
            })
            .populate('author', 'username displayName avatar')
            .sort({ createdAt: -1 });
    
            console.log(`Found ${posts.length} posts with tag ${tag}`);
            
            return res.json({
                posts: posts || []
            });
        } catch (error) {
            console.error('Error getting posts by tag:', error);
            res.status(500).json({ 
                message: 'Failed to fetch posts by tag',
                error: error.message 
            });
        }
    }

   async toggleLike(req, res) {
       try {
           const postId = req.params.postId;
           const userId = req.userId;

           const post = await PostService.findById(postId);
           if (!post) {
               return res.status(404).json({ message: 'Post not found' });
           }

           const updatedPost = await PostService.toggleLike(postId, userId);

           const isLiked = updatedPost.likes.includes(userId);
           if (isLiked) {
               await NotificationService.createLikeNotification(
                   userId,
                   postId,
                   post.author
               );
           }

           return res.json(updatedPost);
       } catch (error) {
           console.error('Like error:', error);
           res.status(400).json({ message: error.message });
       }
   }

   async getOne(req, res) {
       try {
           const post = await PostService.findById(req.params.postId);
           if (!post) {
               return res.status(404).json({ message: 'Post not found' });
           }
           return res.json(post);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   }

   async addComment(req, res) {
       try {
           const { text, parentCommentId } = req.body;
           const postId = req.params.postId;
           const userId = req.userId;
   
           const commentData = {
               text,
               author: userId,
               post: postId,
               parentComment: parentCommentId || null,
               replies: []
           };
   
           const comment = await CommentService.create(commentData);

           const post = await PostService.findById(postId);
           if (post.author.toString() !== userId) {
               await NotificationService.createCommentNotification(
                   userId,
                   postId,
                   post.author
               );
           }

           res.status(201).json(comment);
       } catch (error) {
           console.error('Error adding comment:', error);
           res.status(400).json({ message: error.message });
       }
   }

   async getComments(req, res) {
       try {
           const postId = req.params.postId;
           const comments = await CommentService.getByPostId(postId);
           res.json(comments);
       } catch (error) {
           console.error('Error getting comments:', error);
           res.status(500).json({ message: error.message });
       }
   }

   async updatePost(req, res) {
       try {
           const postId = req.params.postId;
           const userId = req.userId;
           let updateData = { ...req.body };
   
           console.log('Update request debug:', {
               postId,
               userId,
               updateData: {
                   ...updateData,
                   images: updateData.images ? `${updateData.images.length} images` : 'no images'
               }
           });
   
           const post = await PostService.findById(postId);
           if (!post) {
               return res.status(404).json({ message: 'Post not found' });
           }
   
           if (post.author._id.toString() !== userId) {
               return res.status(403).json({ 
                   message: 'Not authorized to edit this post',
                   debug: {
                       postAuthor: post.author._id.toString(),
                       currentUser: userId
                   }
               });
           }

           if (updateData.tags) {
               updateData.tags = updateData.tags.map(tag => 
                   tag.replace(/\s+/g, '_')
               );
           }

           if (updateData.images && updateData.images.length > 0) {
               console.log('Processing updated images...');
               updateData.images = await processImages(updateData.images);
               console.log('Updated images processed successfully');
           }
   
           const updatedPost = await PostService.updatePost(postId, updateData);
           res.json(updatedPost);
       } catch (error) {
           console.error('Error updating post:', error);
           res.status(400).json({ 
               message: error.message,
               stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
           });
       }
   }
   
   async deletePost(req, res) {
        try {
            const postId = req.params.postId;
            const userId = req.userId;  // ID текущего пользователя из JWT токена
    
            // 1. Находим пост
            const post = await PostModel.findById(postId);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
    
            // 2. Проверяем права на удаление
            // Преобразуем ObjectId в строку для корректного сравнения
            if (post.author.toString() !== userId) {
                return res.status(403).json({ 
                    message: 'Not authorized to delete this post',
                    debug: {
                        postAuthor: post.author.toString(),
                        currentUser: userId,
                    }
                });
            }
    
            // 3. Удаляем связанные данные
            await Promise.all([
                // Удаляем комментарии к посту
                CommentModel.deleteMany({ post: postId }),
                // Удаляем уведомления, связанные с постом
                NotificationModel.deleteMany({ post: postId }),
                // Удаляем сам пост
                PostModel.findByIdAndDelete(postId)
            ]);
    
            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(400).json({ message: error.message });
        }
    }
}

export default new PostController();