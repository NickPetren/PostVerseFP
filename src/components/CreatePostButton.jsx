import React, { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import { Plus } from 'lucide-react';

const CreatePostButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        className="create-button"
        onClick={() => setShowModal(true)}
        aria-label="Create new post"
      >
        <Plus size={32} color="white" />
      </button>

      <CreatePostModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default CreatePostButton;