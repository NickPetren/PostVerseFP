import React, { useState } from 'react';
import { Image, X, Tag } from 'lucide-react';
import { BASIC_TAGS, isValidTag, formatTag } from '../basicTags';

const EditPostModal = ({ post, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: post.title,
        text: post.text,
        images: post.images || [],
        tags: post.tags || []
    });
    const [showGallery, setShowGallery] = useState(false);
    const [showBasicTags, setShowBasicTags] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = new window.Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = 800;
                        canvas.height = 800;
                        
                        const size = Math.min(img.width, img.height);
                        const x = (img.width - size) / 2;
                        const y = (img.height - size) / 2;
                        
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        ctx.drawImage(
                            img,
                            x, y, size, size,
                            0, 0, 800, 800
                        );
                        
                        const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
                        resolve(resizedImage);
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newImages).then(processedImages => {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...processedImages]
            }));
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleBasicTagClick = (tagName) => {
        if (formData.tags.length >= 5) {
            setError('Maximum 5 tags allowed');
            return;
        }
        if (!formData.tags.includes(tagName)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagName]
            }));
        }
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const newTag = formatTag(tagInput.trim());
            
            if (newTag && isValidTag(newTag) && !formData.tags.includes(newTag)) {
                if (formData.tags.length >= 5) {
                    setError('Maximum 5 tags allowed');
                } else {
                    setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, newTag]
                    }));
                    setTagInput('');
                    setError('');
                }
            } else if (newTag && !isValidTag(newTag)) {
                setError('Tags can only contain letters, numbers and underscores');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
    
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update post');
            }
    
            onUpdate(responseData);
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="edit-post-modal">
                <h2>Edit Post</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                title: e.target.value
                            }))}
                            className="form-input"
                            placeholder="Title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            value={formData.text}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                text: e.target.value
                            }))}
                            className="form-textarea"
                            placeholder="Write your post..."
                            required
                        />
                    </div>

                    <div className="tags-section">
                        <div className="tags-input-container">
                            <input
                                type="text"
                                placeholder="Add a tag and press Enter..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                className="tag-input"
                                maxLength={30}
                            />
                            <button
                                type="button"
                                className="basic-tags-button"
                                onClick={() => setShowBasicTags(!showBasicTags)}
                            >
                                <Tag size={20} />
                                Basic Tags
                            </button>
                        </div>

                        {showBasicTags && (
                            <div className="basic-tags-list">
                                {BASIC_TAGS.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        className={`basic-tag ${formData.tags.includes(tag.name) ? 'selected' : ''}`}
                                        onClick={() => handleBasicTagClick(tag.name)}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {formData.tags.length > 0 && (
                            <div className="selected-tags">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="tag">
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="remove-tag"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="image-controls">
                        <label className="image-upload-button">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Image size={20} />
                            Add Images
                        </label>
                        {formData.images.length > 0 && (
                            <button
                                type="button"
                                className="gallery-button"
                                onClick={() => setShowGallery(!showGallery)}
                            >
                                Gallery ({formData.images.length})
                            </button>
                        )}
                    </div>

                    {showGallery && (
                        <div className="image-gallery">
                            {formData.images.map((image, index) => (
                                <div key={index} className="image-preview-container">
                                    <img 
                                        src={image} 
                                        alt={`Preview ${index + 1}`} 
                                        className="image-preview"
                                    />
                                    <button 
                                        type="button"
                                        className="remove-image-button"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="modal-buttons">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="save-button"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPostModal;