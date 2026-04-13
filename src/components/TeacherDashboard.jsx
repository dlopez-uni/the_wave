import React, { useMemo, useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';
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

const formatDate = (timestamp) => {
  if (!timestamp) {
    return 'Sin actividad';
  }
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TeacherDashboard = ({
  profiles,
  maxProfiles,
  onBack,
  onResetProfile,
  onDeleteProfile,
  onChangePin,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef(null);
  const [currentPin, setCurrentPin] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt),
    [profiles]
  );

  const handlePinSubmit = () => {
    setFeedback('');
    setError('');

    if (!/^\d{4}$/.test(nextPin)) {
      setError('El nuevo PIN debe tener 4 digitos.');
      return;
    }
    if (nextPin !== confirmPin) {
      setError('La confirmacion no coincide.');
      return;
    }

    const result = onChangePin(currentPin, nextPin);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setFeedback(result.message);
    setCurrentPin('');
    setNextPin('');
    setConfirmPin('');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      'Importar reemplazara todos los perfiles actuales. ¿Continuar?'
    );
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    try {
      await onImport(file);
      setFeedback('Datos importados correctamente.');
      setError('');
    } catch (importError) {
      setError(importError.message || 'No se pudo importar el archivo.');
    }

    event.target.value = '';
  };

  return (
    <section className="teacher-dashboard">
      <div className="teacher-header">
        <div>
          <h1>Panel de profesores</h1>
          <p>
            {profiles.length}/{maxProfiles} perfiles activos
          </p>
        </div>
        <button className="secondary" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      <div className="teacher-grid">
        <div className="teacher-card">
          <h2>Partidas de niños</h2>

          {sortedProfiles.length === 0 ? (
            <p className="teacher-empty">No hay perfiles creados todavia.</p>
          ) : (
            <div className="teacher-profiles-list">
              {sortedProfiles.map((profile) => {
                const avatar = getAvatarById(profile.avatar);
                const progress = getProgress(profile.levels);
                return (
                  <article className="teacher-profile-item" key={profile.id}>
                    <div className="teacher-profile-main">
                      <span className="teacher-avatar">{avatar.emoji}</span>
                      <div>
                        <strong>{profile.name}</strong>
                        <small>
                          {progress.completed}/{progress.total} misiones · Ultima vez: {formatDate(profile.lastPlayedAt)}
                        </small>
                      </div>
                    </div>

                    <div className="teacher-progress-track">
                      <div
                        className="teacher-progress-bar"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>

                    <div className="teacher-actions-row">
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Resetear el progreso de ${profile.name}?`
                          );
                          if (confirmed) {
                            onResetProfile(profile.id);
                          }
                        }}
                      >
                        <RotateCcw size={16} />
                        Resetear
                      </button>
                      <button
                        type="button"
                        className="action-btn danger"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Borrar la partida de ${profile.name}? Esta accion no se puede deshacer.`
                          );
                          if (confirmed) {
                            onDeleteProfile(profile.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                        Borrar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="teacher-card">
          <h2>Ajustes</h2>

          <div className="teacher-tools">
            <button type="button" className="action-btn" onClick={onExport}>
              <Download size={16} />
              Exportar datos (JSON)
            </button>

            <button type="button" className="action-btn" onClick={handleImportClick}>
              <Upload size={16} />
              Importar datos (JSON)
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="teacher-pin-form">
            <h3>Cambiar PIN</h3>
            <label htmlFor="current-pin">PIN actual</label>
            <input
              id="current-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />

            <label htmlFor="next-pin">Nuevo PIN</label>
            <input
              id="next-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={nextPin}
              onChange={(event) => setNextPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />

            <label htmlFor="confirm-pin">Confirmar nuevo PIN</label>
            <input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />

            <button type="button" className="primary" onClick={handlePinSubmit}>
              Guardar PIN
            </button>
          </div>

          {error && <p className="form-error teacher-msg">{error}</p>}
          {feedback && <p className="teacher-msg success">{feedback}</p>}
        </div>
      </div>
    </section>
  );
};

export default TeacherDashboard;
