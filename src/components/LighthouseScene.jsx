import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LighthouseScene = ({ pinStates }) => {
  const ledState = pinStates[13] || false;
  
  // Track toggles locally based on pinStates changes
  const [toggleCount, setToggleCount] = useState(0);
  const [lastState, setLastState] = useState(ledState);

  useEffect(() => {
    if (ledState !== lastState) {
      setToggleCount((prev) => prev + 1);
      setLastState(ledState);
    }
  }, [ledState, lastState]);

  // Ship moves closer whenever LED has been toggled
  const shipProgress = useMemo(() => {
    return Math.min(toggleCount * 15, 70);
  }, [toggleCount]);

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #1e3a8a, #1e40af)', position: 'relative', overflow: 'hidden', borderRadius: '0 24px 24px 0' }}>
      {/* Stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '4px', height: '4px', background: 'white', borderRadius: '50%',
            top: `${5 + Math.random() * 30}%`,
            left: `${5 + Math.random() * 90}%`,
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Moon */}
      <div style={{ position: 'absolute', top: '24px', right: '48px', width: '40px', height: '40px', background: '#fef9c3', borderRadius: '50%', boxShadow: '0 0 20px rgba(254,249,195,0.5)' }}>
        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '28px', height: '28px', background: 'linear-gradient(to bottom, #1e3a8a, #1e40af)', borderRadius: '50%' }} />
      </div>

      {/* Fog overlay */}
      <AnimatePresence>
        {!ledState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(209,213,219,0.4), rgba(107,114,128,0.3))', pointerEvents: 'none', zIndex: 10 }}
          />
        )}
      </AnimatePresence>

      {/* Waves */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '128px' }}>
        <motion.div
          style={{ position: 'absolute', bottom: '64px', left: 0, right: 0, height: '80px' }}
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 400 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,20 Q50,5 100,20 Q150,35 200,20 Q250,5 300,20 Q350,35 400,20 L400,40 L0,40 Z" fill="#1e3a5f" opacity="0.6" />
          </svg>
        </motion.div>
        <motion.div
          style={{ position: 'absolute', bottom: '32px', left: 0, right: 0, height: '64px' }}
          animate={{ x: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 400 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,15 Q40,30 80,15 Q120,0 160,15 Q200,30 240,15 Q280,0 320,15 Q360,30 400,15 L400,40 L0,40 Z" fill="#1e3a5f" opacity="0.8" />
          </svg>
        </motion.div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: '#1e3a5f' }} />
      </div>

      {/* Rocky island */}
      <div style={{ position: 'absolute', bottom: '40px', right: '32px', width: '128px', height: '80px' }}>
        <svg viewBox="0 0 130 50" fill="none" style={{ width: '100%', height: '100%' }}>
          <path d="M10,50 Q30,20 50,25 Q65,10 80,20 Q100,15 120,50 Z" fill="#4b5563" />
          <path d="M15,50 Q35,25 55,28 Q68,15 83,23 Q105,20 115,50 Z" fill="#6b7280" />
        </svg>
      </div>

      {/* Lighthouse */}
      <div style={{ position: 'absolute', bottom: '112px', right: '64px' }}>
        <svg width="50" height="90" viewBox="0 0 50 90" fill="none">
          {/* Tower */}
          <path d="M15,90 L12,30 L38,30 L35,90 Z" fill="#ef4444" />
          <path d="M17,90 L14,30 L25,30 L22,90 Z" fill="#fca5a5" opacity="0.4" />

          {/* Stripes */}
          <rect x="13" y="45" width="24" height="6" fill="white" opacity="0.9" />
          <rect x="13.5" y="60" width="23" height="6" fill="white" opacity="0.9" />
          <rect x="14" y="75" width="22" height="6" fill="white" opacity="0.9" />

          {/* Lamp room */}
          <rect x="10" y="22" width="30" height="12" rx="2" fill="#374151" />

          {/* Glass */}
          <rect x="13" y="24" width="24" height="8" rx="1" fill={ledState ? '#fde047' : '#6b7280'} />

          {/* Dome */}
          <path d="M12,22 Q25,10 38,22 Z" fill="#374151" />
          <circle cx="25" cy="14" r="2" fill="#ef4444" />
        </svg>

        {/* Light beam */}
        <AnimatePresence>
          {ledState && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: '4px', left: '-192px', transformOrigin: 'right center' }}
            >
              <svg width="200" height="40" viewBox="0 0 200 40">
                <defs>
                  <linearGradient id="beamGrad" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="200,15 200,25 0,40 0,0" fill="url(#beamGrad)" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect */}
        <AnimatePresence>
          {ledState && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', top: '-8px', left: '8px', width: '48px', height: '48px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(253,224,71,0.6) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Ship */}
      <motion.div
        style={{ position: 'absolute', bottom: '56px', left: '5%' }}
        animate={{ x: `${shipProgress}vw`, y: [0, -3, 0] }}
        transition={{
          x: { type: 'spring', stiffness: 30, damping: 15 },
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <svg width="60" height="35" viewBox="0 0 60 35" fill="none">
          {/* Hull */}
          <path d="M5,22 L10,30 L50,30 L55,22 Z" fill="#8b5cf6" />
          <path d="M8,22 L12,28 L48,28 L52,22 Z" fill="#a78bfa" />

          {/* Cabin */}
          <rect x="18" y="14" width="16" height="8" rx="2" fill="#c4b5fd" />
          <rect x="20" y="16" width="4" height="4" rx="1" fill="#fde047" opacity="0.8" />
          <rect x="28" y="16" width="4" height="4" rx="1" fill="#fde047" opacity="0.6" />

          {/* Mast */}
          <rect x="28" y="2" width="2" height="14" fill="#6b7280" />

          {/* Flag */}
          <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ transformOrigin: '29px 4px' }}
          >
            <polygon points="30,2 42,5 30,8" fill="#ec4899" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Status indicator */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.875rem', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', zIndex: 20 }}>
        {ledState ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.div
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#facc15' }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span style={{ color: '#ca8a04' }}>Faro: ON</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9ca3af' }} />
            <span style={{ color: '#9ca3af' }}>Faro: OFF</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LighthouseScene;
