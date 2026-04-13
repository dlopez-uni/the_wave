import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings } from 'lucide-react';
import CreateProfileModal from './CreateProfileModal';
import { getAvatarById } from '../data/avatars';

const getProgress = (levels) => {
  const safeLevels = Array.isArray(levels) ? levels : [];
  const completed = safeLevels.filter((level) => level.completed).length;
  return {
    completed,
    total: safeLevels.length || 1,
    percent: safeLevels.length ? Math.round((completed / safeLevels.length) * 100) : 0,
  };
};

const LandingPage = ({ profiles, maxProfiles, onCreateProfile, onSelectProfile, onOpenTeacher }) => {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="landing-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="landing-hero"
      >
        <h1>Elige tu partida</h1>
        <p>Cada niño tiene su progreso guardado. Pulsa un avatar para continuar.</p>
      </motion.div>

      <button className="teacher-entry" onClick={onOpenTeacher}>
        <Settings size={18} />
        Profesores
      </button>

      <div className="profiles-grid">
        {profiles.map((profile, index) => {
          const avatar = getAvatarById(profile.avatar);
          const progress = getProgress(profile.levels);
          return (
            <motion.button
              key={profile.id}
              className="profile-card"
              onClick={() => onSelectProfile(profile)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="profile-avatar">{avatar.emoji}</span>
              <strong>{profile.name}</strong>
              <small>
                {progress.completed}/{progress.total} misiones
              </small>
              <div className="profile-progress-track">
                <div
                  className="profile-progress-bar"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </motion.button>
          );
        })}

        {profiles.length < maxProfiles && (
          <motion.button
            className="profile-card create-card"
            onClick={() => setCreateOpen(true)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="create-icon">
              <Plus size={26} />
            </span>
            <strong>Nuevo niño</strong>
            <small>Crear partida</small>
          </motion.button>
        )}
      </div>

      {profiles.length === 0 && (
        <div className="landing-empty">
          <p>Aun no hay partidas. Crea la primera para empezar.</p>
        </div>
      )}

      <CreateProfileModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={onCreateProfile}
      />
    </section>
  );
};

export default LandingPage;
