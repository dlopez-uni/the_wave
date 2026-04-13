export const getDefaultLevels = () => [
  { 
    id: 1, 
    title: '¡Despegue!', 
    riddle: '¡Hola Inventor! Tu primera misión es hacer que el helicóptero despegue. ¡Usa el bloque de encender LED para activar el motor!', 
    allowedBlocks: ['arduino_led_on'],
    target: 'arduino_led_on',
    completed: false,
    locked: false 
  },
  { 
    id: 2, 
    title: 'El Barco en la Niebla', 
    riddle: '¡Genial! Ahora un barco necesita guía. El barco solo se moverá si el faro está encendido. ¡Enciende el LED para guiar al capitán!',
    allowedBlocks: ['arduino_led_on', 'arduino_led_off', 'arduino_wait'],
    target: 'arduino_led_on',
    completed: false,
    locked: true 
  },
  { 
    id: 3, 
    title: 'Vuelo de Rescate', 
    riddle: '¡Nivel Experto! El helicóptero necesita un chequeo de seguridad. Usa un bloque LÓGICO (Si...) para que el motor solo se encienda cuando tú lo decidas.',
    allowedBlocks: ['arduino_led_on', 'arduino_led_off', 'arduino_wait', 'controls_if', 'logic_compare', 'logic_boolean'],
    target: 'controls_if',
    completed: false,
    locked: true 
  },
];
