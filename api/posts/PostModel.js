import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        type: String,
        required: false
    }],
    tags: [{
        type: String,
        maxlength: 30,
        lowercase: true,
        validate: {
            validator: function(tag) {
                
                return /^[a-zA-Z0-9_]+$/.test(tag);
            },
            message: 'Tags can only contain letters, numbers and underscores'
        }
    }],
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    }
}, {
    timestamps: true
});

PostSchema.pre('save', function(next) {
    if (this.tags) {
        
        this.tags = [...new Set(this.tags.map(tag => tag.toLowerCase()))]
            .slice(0, 5);
    }
    next();
});

export default mongoose.model('Post', PostSchema);