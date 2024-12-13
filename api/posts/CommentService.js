import Comment from './CommentModel.js';

class CommentService {
    async create(data) {
        try {
            const comment = await Comment.create(data);
            
            if (data.parentComment) {
                const parentComment = await Comment.findById(data.parentComment);
                if (!parentComment) {
                    throw new Error('Parent comment not found');
                }
                
                if (!parentComment.replies) {
                    parentComment.replies = [];
                }
                parentComment.replies.push(comment._id);
                await parentComment.save();

                const rootComment = await this.findRootComment(data.parentComment);
                return await rootComment.populate([
                    { path: 'author', select: 'username displayName avatar' },
                    { 
                        path: 'replies',
                        populate: [
                            { path: 'author', select: 'username displayName avatar' },
                            {
                                path: 'replies',
                                populate: { 
                                    path: 'author', 
                                    select: 'username displayName avatar' 
                                }
                            }
                        ]
                    }
                ]);
            }

            return await comment.populate([
                { path: 'author', select: 'username displayName avatar' },
                { 
                    path: 'replies',
                    populate: { 
                        path: 'author', 
                        select: 'username displayName avatar' 
                    }
                }
            ]);
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    async findRootComment(commentId) {
        const comment = await Comment.findById(commentId);
        if (!comment.parentComment) {
            return comment;
        }
        return await this.findRootComment(comment.parentComment);
    }

    async getByPostId(postId) {
        try {
            return await Comment.find({ 
                post: postId, 
                parentComment: null
            })
            .populate([
                { path: 'author', select: 'username displayName avatar' },
                { 
                    path: 'replies',
                    populate: [
                        { path: 'author', select: 'username displayName avatar' },
                        {
                            path: 'replies',
                            populate: { 
                                path: 'author', 
                                select: 'username displayName avatar' 
                            }
                        }
                    ]
                }
            ])
            .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error getting comments:', error);
            throw error;
        }
    }
}

export default new CommentService();