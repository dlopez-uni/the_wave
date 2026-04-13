export const getDefaultLevels = () => [
  { 
    id: 1, 
    title: 'El Faro y el Bucle', 
    riddle: '¡Hola Inventor! Para que la luz del faro brille constantemente, debemos poner el bloque de encender LED dentro de "Siempre 🔄". ¡Pruébalo!', 
    allowedBlocks: ['arduino_led_on'],
    target: 'arduino_led_on',
    completed: false,
    locked: false 
  },
  { 
    id: 2, 
    title: 'Prueba de Hélices', 
    riddle: '¡Genial! Ahora toca probar el motor del helicóptero. En el bloque "Siempre 🔄", haz esta secuencia: Enciende hélice, espera, apágala, espera y vuelve a encender.',
    allowedBlocks: ['arduino_fan_on', 'arduino_fan_off', 'arduino_wait'],
    target: 'arduino_fan_on',
    completed: false,
    locked: true 
  },
  { 
    id: 3, 
    title: 'Despegue Inteligente', 
    riddle: '¡Nivel Experto! Queremos que las hélices solo se activen con seguridad. Usa un bloque LÓGICO (Si...) para controlar cuándo encender el motor.',
    allowedBlocks: ['arduino_fan_on', 'arduino_fan_off', 'arduino_wait', 'controls_if', 'logic_compare', 'logic_boolean'],
    target: 'controls_if',
    completed: false,
    locked: true 
  },
];
