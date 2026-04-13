import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HelicopterScene = ({ pinStates, isSimulating }) => {
  // Solo vuela si estamos en simulación y el pin 13 está activo
  const fanRunning = isSimulating && (pinStates[13] || false);

  const bladeSpeed = useMemo(() => {
    return fanRunning ? 0.3 : 0;
  }, [fanRunning]);

  const helicopterY = useMemo(() => {
    return fanRunning ? -60 : 0;
  }, [fanRunning]);

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #7dd3fc, #e0f2fe)', position: 'relative', overflow: 'hidden', borderRadius: '0 24px 24px 0' }}>
      {/* Clouds */}
      <motion.div
        style={{ position: 'absolute', top: '15%', left: '10%' }}
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Cloud />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', top: '25%', right: '15%' }}
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Cloud size="small" />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', top: '8%', left: '55%' }}
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Cloud size="small" />
      </motion.div>

      {/* Ground */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '96px', background: 'linear-gradient(to top, #4ade80, #86efac)', borderTopLeftRadius: '40px', borderTopRightRadius: '40px' }}>
        <div style={{ position: 'absolute', bottom: '16px', left: '32px', width: '24px', height: '40px', background: '#16a34a', borderRadius: '9999px' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '48px', width: '20px', height: '56px', background: '#22c55e', borderRadius: '9999px' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '48px', width: '28px', height: '48px', background: '#16a34a', borderRadius: '9999px' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '80px', width: '16px', height: '32px', background: '#22c55e', borderRadius: '9999px' }} />
      </div>

      {/* Landing pad */}
      <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '112px', height: '16px', background: '#9ca3af', borderRadius: '9999px', opacity: 0.6 }} />

      {/* Helicopter */}
      <motion.div
        style={{ position: 'absolute', bottom: '96px', left: '50%', transform: 'translateX(-50%)', marginLeft: '-70px' }}
        animate={{ y: helicopterY }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
      >
        <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
          {/* Body */}
          <ellipse cx="70" cy="65" rx="35" ry="20" fill="#ef4444" />
          <ellipse cx="70" cy="62" rx="32" ry="16" fill="#f87171" />

          {/* Cockpit window */}
          <ellipse cx="82" cy="60" rx="12" ry="10" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />

          {/* Tail */}
          <rect x="20" y="58" width="22" height="8" rx="4" fill="#dc2626" />
          <rect x="12" y="48" width="8" height="18" rx="4" fill="#ef4444" />

          {/* Tail rotor */}
          {bladeSpeed > 0 ? (
            <motion.g
              animate={{ rotate: 360 }}
              transition={{
                duration: bladeSpeed * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: '16px 48px' }}
            >
              <rect x="10" y="38" width="12" height="4" rx="2" fill="#94a3b8" />
              <rect x="10" y="52" width="12" height="4" rx="2" fill="#94a3b8" />
            </motion.g>
          ) : (
            <>
              <rect x="10" y="38" width="12" height="4" rx="2" fill="#94a3b8" />
              <rect x="10" y="52" width="12" height="4" rx="2" fill="#94a3b8" />
            </>
          )}

          {/* Rotor mast */}
          <rect x="67" y="38" width="6" height="12" rx="2" fill="#6b7280" />

          {/* Main rotor blades */}
          {bladeSpeed > 0 ? (
            <motion.g
              animate={{ rotate: 360 }}
              transition={{
                duration: bladeSpeed,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: '70px 40px' }}
            >
              <rect x="10" y="37" width="120" height="6" rx="3" fill="#64748b" opacity="0.85" />
            </motion.g>
          ) : (
            <rect x="10" y="37" width="120" height="6" rx="3" fill="#64748b" opacity="0.85" />
          )}

          {/* Skids */}
          <rect x="48" y="82" width="6" height="12" rx="2" fill="#6b7280" />
          <rect x="86" y="82" width="6" height="12" rx="2" fill="#6b7280" />
          <rect x="40" y="92" width="60" height="4" rx="2" fill="#4b5563" />
        </svg>

        {/* Wind effect when flying */}
        <AnimatePresence>
          {fanRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{ position: 'absolute', width: '8px', height: '8px', background: '#bae6fd', borderRadius: '50%', left: `${(i - 2) * 15}px`, top: 0 }}
                  animate={{
                    y: [0, 20, 40],
                    opacity: [0.6, 0.3, 0],
                    scale: [1, 1.5, 2],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status indicator */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.875rem', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {fanRunning ? (
          <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              🌀
            </motion.span>
            Hélices: ON
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>Hélices: OFF</span>
        )}
      </div>
    </div>
  );
};

// ─── Cloud SVG ───
const Cloud = ({ size = 'normal' }) => {
  const scale = size === 'small' ? 0.6 : 1;
  return (
    <svg
      width={80 * scale}
      height={40 * scale}
      viewBox="0 0 80 40"
      fill="none"
    >
      <ellipse cx="40" cy="28" rx="36" ry="12" fill="white" opacity="0.8" />
      <ellipse cx="30" cy="20" rx="18" ry="14" fill="white" opacity="0.9" />
      <ellipse cx="52" cy="22" rx="14" ry="12" fill="white" opacity="0.85" />
      <ellipse cx="40" cy="16" rx="12" ry="10" fill="white" opacity="0.95" />
    </svg>
  );
};

export default HelicopterScene;
