import React from 'react';
import { motion } from 'framer-motion';

const CharacterMascot = ({
  size = 120,
  speaking = false,
  emotion = 'happy',
}) => {
  const eyeScale = emotion === 'excited' ? 1.2 : 1;
  const mouthWidth = emotion === 'excited' ? 14 : emotion === 'thinking' ? 6 : 10;

  return (
    <motion.div
      animate={
        speaking
          ? { y: [0, -5, 0], rotate: [-2, 2, -2] }
          : { y: [0, -4, 0] }
      }
      transition={{
        duration: speaking ? 0.6 : 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ width: size, height: size, zIndex: 50, position: 'relative' }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
      >
        {/* Body */}
        <rect x="20" y="35" width="60" height="45" rx="16" fill="#8b5cf6" />
        <rect x="24" y="39" width="52" height="37" rx="12" fill="#a78bfa" />

        {/* Head */}
        <rect x="18" y="12" width="64" height="35" rx="17" fill="#8b5cf6" />
        <rect x="22" y="16" width="56" height="27" rx="13" fill="#c4b5fd" />

        {/* Antenna */}
        <rect x="47" y="2" width="6" height="14" rx="3" fill="#8b5cf6" />
        <motion.circle
          cx="50"
          cy="4"
          r="5"
          fill="#fde047"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Eyes */}
        <motion.g animate={{ scaleY: eyeScale }} style={{ transformOrigin: '50px 28px' }}>
          <circle cx="37" cy="28" r="6" fill="white" />
          <circle cx="63" cy="28" r="6" fill="white" />
          <motion.circle
            cx="38"
            cy="28"
            r="3"
            fill="#1e1b4b"
            animate={{ cx: speaking ? [37, 39, 37] : 38 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="64"
            cy="28"
            r="3"
            fill="#1e1b4b"
            animate={{ cx: speaking ? [63, 65, 63] : 64 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Eye shine */}
          <circle cx="36" cy="26" r="1.5" fill="white" opacity="0.8" />
          <circle cx="62" cy="26" r="1.5" fill="white" opacity="0.8" />
        </motion.g>

        {/* Mouth */}
        {emotion === 'thinking' ? (
          <circle cx="50" cy="38" r={mouthWidth / 2} fill="#7c3aed" />
        ) : (
          <motion.rect
            x={50 - mouthWidth / 2}
            y="35"
            width={mouthWidth}
            height="5"
            rx="2.5"
            fill="#7c3aed"
            animate={speaking ? { height: [5, 8, 5] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}

        {/* Cheeks */}
        <circle cx="28" cy="34" r="4" fill="#f9a8d4" opacity="0.5" />
        <circle cx="72" cy="34" r="4" fill="#f9a8d4" opacity="0.5" />

        {/* Arms */}
        <motion.rect
          x="8"
          y="45"
          width="14"
          height="8"
          rx="4"
          fill="#8b5cf6"
          animate={speaking ? { rotate: [-5, 10, -5] } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ transformOrigin: '20px 49px' }}
        />
        <motion.rect
          x="78"
          y="45"
          width="14"
          height="8"
          rx="4"
          fill="#8b5cf6"
          animate={speaking ? { rotate: [5, -10, 5] } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
          style={{ transformOrigin: '80px 49px' }}
        />

        {/* Feet */}
        <rect x="30" y="78" width="14" height="10" rx="5" fill="#7c3aed" />
        <rect x="56" y="78" width="14" height="10" rx="5" fill="#7c3aed" />

        {/* Belly button / detail */}
        <circle cx="50" cy="58" r="4" fill="#7c3aed" opacity="0.4" />
        <circle cx="50" cy="58" r="2" fill="#fde047" />
      </svg>
    </motion.div>
  );
};

export default CharacterMascot;
