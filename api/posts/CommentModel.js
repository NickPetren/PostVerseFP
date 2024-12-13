import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

CommentSchema.methods.addReply = async function(replyId) {
    if (!this.replies) {
        this.replies = [];
    }
    this.replies.push(replyId);
    await this.save();
};

export default mongoose.model('Comment', CommentSchema);