import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS } from '../data/avatars';

const CreateProfileModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName('');
    setSelectedAvatar(AVATARS[0].id);
    setError('');
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Escribe un nombre para continuar.');
      return;
    }

    try {
      onCreate({ name: trimmedName, avatar: selectedAvatar });
      onClose();
    } catch (createError) {
      setError(createError.message || 'No se pudo crear el perfil.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="create-profile-modal"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Crear partida nueva</h2>
            <p>Elige un nombre y un avatar para empezar la aventura.</p>

            <label htmlFor="child-name">Nombre</label>
            <input
              id="child-name"
              type="text"
              maxLength={15}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              placeholder="Ej: Mateo"
              autoFocus
            />

            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar.id)}
                >
                  <span>{avatar.emoji}</span>
                  <small>{avatar.label}</small>
                </button>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="ghost-btn">
                Cancelar
              </button>
              <button type="button" className="primary" onClick={handleSubmit}>
                Empezar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProfileModal;
