import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PinModal = ({ isOpen, onClose, onValidate }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setDigits(['', '', '', '']);
    setError('');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 60);
  }, [isOpen]);

  const pinValue = useMemo(() => digits.join(''), [digits]);

  const updateDigit = (index, value) => {
    const safeValue = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = safeValue;
    setDigits(next);

    if (error) {
      setError('');
    }

    if (safeValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (pinValue.length !== 4) {
      setError('Ingresa los 4 digitos del PIN.');
      setShakeKey((prev) => prev + 1);
      return;
    }

    const isValid = await onValidate(pinValue);
    if (!isValid) {
      setError('PIN incorrecto.');
      setShakeKey((prev) => prev + 1);
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
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
            key={shakeKey}
            className="pin-modal"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={error ? { opacity: 1, y: 0, scale: 1, x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Acceso profes</h2>
            <p>Ingresa el PIN para abrir la zona de profesores.</p>

            <div className="pin-input-row">
              {digits.map((digit, index) => (
                <input
                  key={`pin-${index}`}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  aria-label={`Digito ${index + 1}`}
                />
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="ghost-btn">
                Cerrar
              </button>
              <button type="button" className="primary" onClick={handleSubmit}>
                Entrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PinModal;
