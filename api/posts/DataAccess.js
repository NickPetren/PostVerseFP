import Post from './PostModel.js';

class PostDataAccess {
    async findById(postId) {
        try {
            return await Post.findById(postId)
                .populate('author', 'username displayName avatar');
        } catch (error) {
            console.error('Find by ID error:', error);
            throw error;
        }
    }

    async update(post) {
        try {
            return await Post.findByIdAndUpdate(
                post._id,
                { $set: { likes: post.likes } },
                { 
                    new: true,
                    runValidators: true 
                }
            ).populate('author', 'username displayName avatar');
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    async create(postData) {
        try {
            console.log('DataAccess creating post with data:', {
                ...postData,
                images: postData.images ? `${postData.images.length} images` : 'no images'
            });
            const post = await Post.create(postData);
            const populatedPost = await post.populate('author', 'username displayName avatar');
            console.log('Created post:', populatedPost);
            return populatedPost;
        } catch (error) {
            console.error('DataAccess create error:', error);
            throw error;
        }
    }

    async deletePost(postId) {
        return await Post.findByIdAndDelete(postId);
    }

    async getAll(skip = 0, limit = 10) {
        try {
            return await Post.find()
                .populate('author', 'username displayName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        } catch (error) {
            console.error('DataAccess error:', error);
            throw error;
        }
    }

    async getUserPosts(userId) {
        try {
            return await Post.find({ author: userId })
                .populate('author', 'username displayName avatar')
                .sort({ createdAt: -1 });
        } catch (error) {
            console.error('DataAccess error getting user posts:', error);
            throw error;
        }
    }

    async updatePost(postId, updateData) {
        return await Post.findByIdAndUpdate(
            postId,
            { $set: updateData },
            { 
                new: true,
                runValidators: true
            }
        ).populate('author', 'username displayName avatar');
    }
}

export default new PostDataAccess();