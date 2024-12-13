
import React, { useState } from 'react';
import { X } from 'lucide-react';

const PostImages = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!images || images.length === 0) return null;

    const renderImageGrid = () => {
        switch(images.length) {
            case 1:
                return (
                    <div className="single-image">
                        <img 
                            src={images[0]} 
                            alt="Post content" 
                            onClick={() => setSelectedImage(images[0])}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="double-image">
                        {images.map((img, index) => (
                            <img 
                                key={index} 
                                src={img} 
                                alt={`Post content ${index + 1}`}
                                onClick={() => setSelectedImage(img)}
                            />
                        ))}
                    </div>
                );
            default:
                return (
                    <div className="image-grid">
                        {images.slice(0, 4).map((img, index) => (
                            <div 
                                key={index} 
                                className={`grid-item ${index === 3 && images.length > 4 ? 'has-more' : ''}`}
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`Post content ${index + 1}`} />
                                {index === 3 && images.length > 4 && (
                                    <div className="more-images">
                                        +{images.length - 4}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="post-images">
            {renderImageGrid()}

            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <button className="close-modal" onClick={() => setSelectedImage(null)}>
                        <X size={24} />
                    </button>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage} alt="Full size" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostImages;