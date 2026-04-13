export const getDefaultLevels = () => [
  { 
    id: 1, 
    title: 'El Gran Comienzo', 
    riddle: '¡Hola Inventor! Un barco se acerca a la costa en la niebla. Tu primera misión es encender la luz del faro usando el módulo LED.', 
    allowedBlocks: ['arduino_led_on'],
    target: 'arduino_led_on',
    completed: false,
    locked: false 
  },
  { 
    id: 2, 
    title: 'Señales de Alerta', 
    riddle: '¡Genial! Ahora debemos probar el sistema de luces del helicóptero haciéndolo parpadear como alerta: enciende, espera y apaga.',
    allowedBlocks: ['arduino_led_on', 'arduino_led_off', 'arduino_wait'],
    target: 'arduino_wait',
    completed: false,
    locked: true 
  },
  { 
    id: 3, 
    title: 'Despegue de Emergencia', 
    riddle: '¡Nivel Experto! El helicóptero necesita un chequeo de seguridad. Usa un bloque LÓGICO (Si...) de la caja de herramientas, e introduce dentro el bloque de "Encender LED" para activar el motor principal.',
    allowedBlocks: ['arduino_led_on', 'arduino_led_off', 'arduino_wait', 'controls_if', 'logic_compare', 'logic_boolean'],
    target: 'controls_if',
    completed: false,
    locked: true 
  },
];
