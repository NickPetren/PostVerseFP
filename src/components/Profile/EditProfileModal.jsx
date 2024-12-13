import React, { useState } from 'react';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        email: user.email || '',
        displayName: user.displayName || '',
        avatar: user.avatar || ''
    });
    const [previewUrl, setPreviewUrl] = useState(user.avatar || '');
    const [error, setError] = useState('');

    // Функция для генерации username из displayName
    const generateUsername = (displayName) => {
        return displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = 500;
                    canvas.height = 500;
                    
                    const size = Math.min(img.width, img.height);
                    const x = (img.width - size) / 2;
                    const y = (img.height - size) / 2;
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.drawImage(
                        img,
                        x, y, size, size,
                        0, 0, 500, 500
                    );
                    
                    const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
                    
                    setPreviewUrl(resizedImage);
                    setFormData(prev => ({ ...prev, avatar: resizedImage }));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Добавляем сгенерированный username к данным формы
            const username = generateUsername(formData.displayName);
            const dataToSend = {
                ...formData,
                username
            };

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5177/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error updating profile');
            }

            // Обновляем данные в localStorage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            onUpdate(updatedUser);
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    // Вычисляем username на основе текущего displayName
    const currentUsername = generateUsername(formData.displayName);

    return (
        <div className="modal-overlay">
            <div className="edit-profile-modal">
                <h2>Edit Profile</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="avatar-edit">
                        <div className="avatar-preview-container">
                            <img 
                                src={previewUrl || '/default-avatar.png'} 
                                alt="Profile preview" 
                                className="avatar-preview"
                            />
                            <div className="avatar-edit-overlay">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="avatar-input"
                                />
                                <span>Change Photo</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                displayName: e.target.value
                            }))}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Username (auto-generated)</label>
                        <input
                            type="text"
                            value={currentUsername}
                            disabled
                            className="form-input disabled"
                        />
                    </div>

                    <div className="modal-buttons">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={onClose}
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

export default EditProfileModal;