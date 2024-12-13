import React from 'react';
import { X } from 'lucide-react';

const ImageGallery = ({ images, onRemove }) => {
    return (
        <div className="image-gallery">
            {images.map((image, index) => (
                <div key={index} className="image-preview-container">
                    <img 
                        src={image} 
                        alt={`Preview ${index}`} 
                        className="image-preview"
                    />
                    <button 
                        className="remove-image-button"
                        onClick={() => onRemove(index)}
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;