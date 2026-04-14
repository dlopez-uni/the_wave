import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, RotateCcw, PartyPopper } from 'lucide-react';
import CharacterMascot from './CharacterMascot';

const confettiColors = ['#22c55e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899', '#ef4444'];

const CompletionModal = ({
  isOpen,
  missionTitle,
  completionMessage,
  stars = 3,
  onNext,
  onRetry,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)'
          }}
          id="completion-modal"
        >
          {/* Confetti particles */}
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                zIndex: 40,
                background: confettiColors[i % confettiColors.length],
                left: `${10 + Math.random() * 80}%`,
                top: '-5%',
              }}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{
                y: `${80 + Math.random() * 40}vh`,
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0],
                x: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{
              position: 'relative',
              zIndex: 10,
              background: '#ffffff',
              padding: '32px',
              textAlign: 'center',
              width: '100%',
              maxWidth: '450px',
              borderRadius: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              border: '4px solid #fff'
            }}
          >
            {/* Mascot */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}
            >
              <CharacterMascot size={110} emotion="excited" speaking />
            </motion.div>

            {/* Title */}
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: 'spring' }}
                style={{ position: 'absolute', left: '0', top: '-10px', zIndex: 1 }}
              >
                <PartyPopper size={32} color="#f59e0b" style={{ transform: 'scaleX(-1)' }} />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: '2.1rem',
                  fontFamily: 'var(--font-playful)',
                  color: 'var(--primary)',
                  marginBottom: '8px',
                  lineHeight: 1.2,
                  position: 'relative',
                  zIndex: 2,
                  padding: '0 20px'
                }}
              >
                ¡Misión Completada!
              </motion.h2>

              <motion.div
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: 'spring' }}
                style={{ position: 'absolute', right: '0', top: '-10px', zIndex: 1 }}
              >
                <PartyPopper size={32} color="#f59e0b" />
              </motion.div>
            </div>


            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#8b5cf6',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {missionTitle}
            </motion.p>

            {/* Stars */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}
            >
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    delay: 0.7 + s * 0.15,
                    stiffness: 200,
                  }}
                >
                  <Star
                    style={{
                      width: '48px',
                      height: '48px',
                      color: s <= stars ? '#ffc800' : '#e5e7eb',
                      fill: s <= stars ? '#ffc800' : '#e5e7eb',
                      filter: s <= stars ? 'drop-shadow(0 4px 8px rgba(250,204,21,0.4))' : 'none',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '32px',
                lineHeight: 1.5,
              }}
            >
              {completionMessage}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexDirection: 'column' }}
            >
              <button
                onClick={onNext}
                className="primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                SIGUIENTE AVENTURA
                <ArrowRight size={24} />
              </button>
              
              <button
                onClick={onRetry}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={20} />
                Volver a intentarlo
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompletionModal;
