import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  Cpu, 
  Map as MapIcon, 
  User, 
  Trophy, 
  Zap,
  ArrowLeft,
  Settings,
  HelpCircle,
  AlertCircle,
  Link,
  Unlink,
  ExternalLink,
  Bot,
  Plug,
  Info,
  ChevronRight,
  Monitor,
  Code,
  EyeOff
} from 'lucide-react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import Es from 'blockly/msg/es';

// Components
import CharacterMascot from './components/CharacterMascot';
import CompletionModal from './components/CompletionModal';
import HelicopterScene from './components/HelicopterScene';
import LighthouseScene from './components/LighthouseScene';
import LandingPage from './components/LandingPage';
import PinModal from './components/PinModal';
import TeacherDashboard from './components/TeacherDashboard';
import { getDefaultLevels } from './data/defaultLevels';
import { getAvatarById } from './data/avatars';
import { MAX_PROFILES, useAppData } from './hooks/useStorage';

// AI Utilities
import { getMissionHint } from './mistralApi';
import { getKidsSystemPrompt, buildKidsUserPrompt } from './prompts';
import { serializeWorkspace, buildContextSummary, getMissionProgressScore } from './blocklySerializer';

// Locale and Block Registration
Blockly.setLocale(Es);

// Define Blocks Globally
if (!Blockly.Blocks['arduino_setup']) {
  Blockly.Blocks['arduino_setup'] = {
    init: function() {
      this.appendDummyInput().appendField("Al empezar 🟢");
      this.appendStatementInput("STACK").setCheck(null);
      this.setColour("#58cc02");
      this.setTooltip("Se ejecuta una vez al inicio");
    }
  };
}

if (!Blockly.Blocks['arduino_loop']) {
  Blockly.Blocks['arduino_loop'] = {
    init: function() {
      this.appendDummyInput().appendField("Siempre 🔄");
      this.appendStatementInput("STACK").setCheck(null);
      this.setColour("#1cb0f6");
      this.setTooltip("Se ejecuta una y otra vez");
    }
  };
}

if (!Blockly.Blocks['arduino_led_on']) {
  Blockly.Blocks['arduino_led_on'] = {
    init: function() {
      this.appendDummyInput().appendField("Encender LED 💡");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#58cc02");
    }
  };
}

if (!Blockly.Blocks['arduino_led_off']) {
  Blockly.Blocks['arduino_led_off'] = {
    init: function() {
      this.appendDummyInput().appendField("Apagar LED 🌑");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ff4b4b");
    }
  };
}

if (!Blockly.Blocks['arduino_wait']) {
  Blockly.Blocks['arduino_wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Esperar")
          .appendField(new Blockly.FieldTextInput("1"), "SECONDS")
          .appendField("segundos");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ffc800");
    }
  };
}

// --- Components ---

const KitBotAssistant = ({ isConnected, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        background: isConnected ? '#f0fdf4' : '#f7f7f7',
        border: `2px solid ${isConnected ? '#0ea5e9' : '#e5e5e5'}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={isConnected ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ 
            position: 'absolute', 
            top: -2, left: -2, right: -2, bottom: -2, 
            borderRadius: '50%', 
            background: isConnected ? '#0ea5e9' : 'transparent' 
          }}
        />
        <div style={{ 
          width: '32px', height: '32px', 
          borderRadius: '50%', 
          background: isConnected ? '#0ea5e9' : '#ccc', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1
        }}>
          {isConnected ? <Bot size={18} color="white" /> : <Bot size={18} color="#999" />}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: isConnected ? '#0ea5e9' : '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isConnected ? '¡Kit Despierto!' : 'Kit Durmiendo'}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4b4b4b' }}>
          {isConnected ? '¡Hola, Amigo! 😍' : 'Tócame para hablar 😴'}
        </span>
      </div>
    </motion.div>
  );
};

const MissionStatus = ({ pinStates, isConnected }) => {
  return (
    <div className="mission-panel glass" style={{ padding: '20px', borderRadius: '24px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 15px' }}>
        <div style={{ 
          width: '100%', height: '100%', 
          background: pinStates[13] ? 'var(--accent)' : '#f0f0f0', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: pinStates[13] ? '0 0 20px var(--accent)' : 'none',
          transition: 'all 0.3s ease',
          border: '4px solid white'
        }}>
          <Zap size={30} color={pinStates[13] ? 'white' : '#ccc'} fill={pinStates[13] ? 'white' : 'none'} />
        </div>
        {isConnected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ position: 'absolute', bottom: -5, right: -5, background: '#0ea5e9', width: '22px', height: '22px', borderRadius: '50%', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />
          </motion.div>
        )}
      </div>
      <h3 style={{ fontFamily: 'var(--font-playful)', fontSize: '1.1rem', color: '#4b4b4b' }}>Estado del Kit</h3>
      <p style={{ fontSize: '0.8rem', color: '#777' }}>
        {isConnected ? "¡El kit real está escuchando! ⚡" : "Viendo el simulador... 🌑"}
      </p>
    </div>
  );
};

const LevelMap = ({ onSelectLevel, levels }) => {
  const getOffset = (index) => Math.sin(index * 1.8) * 70; // Generates a zig-zag wavy offset

  return (
    <div className="level-path" style={{ position: 'relative', minHeight: '80vh', overflow: 'hidden' }}>
      {/* Background playful elements */}
      <motion.div animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '4rem', opacity: 0.4 }}>☁️</motion.div>
      <motion.div animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }} transition={{ duration: 5, repeat: Infinity }} style={{ position: 'absolute', top: '45%', right: '12%', fontSize: '3rem', opacity: 0.4 }}>☁️</motion.div>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', bottom: '10%', left: '15%', fontSize: '2rem', opacity: 0.5 }}>✨</motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: 'absolute', top: '25%', right: '25%', fontSize: '1.5rem', opacity: 0.6 }}>⭐</motion.div>


      
      {levels.map((level, index) => {
        const currentOffset = getOffset(index);
        const nextOffset = index < levels.length - 1 ? getOffset(index + 1) : 0;
        
        return (
          <div key={level.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <motion.div 
              whileHover={{ scale: level.locked ? 1 : 1.15, rotate: level.locked ? 0 : [0, -5, 5, 0] }}
              initial={{ y: 50, opacity: 0, x: currentOffset }}
              animate={{ y: 0, opacity: 1, x: currentOffset }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className={`level-node ${level.completed ? 'completed' : ''} ${level.locked ? 'locked' : ''}`}
              onClick={() => !level.locked && onSelectLevel(level)}
            >
              {level.locked ? <span style={{ fontSize: '2rem' }}>🔒</span> : (level.completed ? <span style={{ fontSize: '2rem' }}>⭐</span> : <span style={{ fontSize: '2rem', fontWeight: 900 }}>{level.id}</span>)}
            </motion.div>
            
            <motion.span 
              initial={{ opacity: 0, x: currentOffset }}
              animate={{ opacity: 1, x: currentOffset }}
              transition={{ delay: index * 0.1 + 0.2 }}
              style={{ marginTop: '12px', fontWeight: '900', fontFamily: 'var(--font-playful)', color: '#4b4b4b', fontSize: '1.2rem', textTransform: 'uppercase' }}
            >
              {level.title}
            </motion.span>
            
            {index < levels.length - 1 && (
              <svg width="200" height="70" style={{ margin: '5px 0', overflow: 'visible' }}>
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                  d={`M ${100 + currentOffset} 0 C ${100 + currentOffset} 35, ${100 + nextOffset} 35, ${100 + nextOffset} 70`} 
                  stroke={level.completed ? "var(--primary)" : "#e2e8f0"} 
                  strokeWidth="12" 
                  strokeLinecap="round"
                  strokeDasharray="1 24"
                  fill="none" 
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const {
    appData,
    ready,
    profiles,
    createProfile,
    deleteProfile,
    resetProfileProgress,
    touchProfile,
    setProfileLevels,
    updateTeacherPin,
    exportJSON,
    importJSON,
  } = useAppData();

  const [view, setView] = useState('landing');
  const [activeProfile, setActiveProfile] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levels, setLevels] = useState(getDefaultLevels());
  const [pinStates, setPinStates] = useState({ 13: false });
  const [isSimulating, setIsSimulating] = useState(false);
  const [runId, setRunId] = useState(0);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'success', 'error', 'kit-wizard', 'adult-setup', 'code-preview'
  const [generatedCode, setGeneratedCode] = useState('');
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [showCodeInSim, setShowCodeInSim] = useState(false);
  
  // AI States
  const [aiHint, setAiHint] = useState('');
  const [aiEmoji, setAiEmoji] = useState('🤖');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [lastProgressTime, setLastProgressTime] = useState(Date.now());
  const [hintRequested, setHintRequested] = useState(false);
  const [lastManualHintTime, setLastManualHintTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Serial State
  const [isConnected, setIsConnected] = useState(false);
  const serialPort = useRef(null);
  const serialWriter = useRef(null);

  const activeAvatar = activeProfile ? getAvatarById(activeProfile.avatar) : null;

  const getProgress = (profileLevels) => {
    const safeLevels = Array.isArray(profileLevels) ? profileLevels : [];
    const completed = safeLevels.filter((level) => level.completed).length;
    const total = safeLevels.length || 1;
    return { completed, total };
  };

  const activeProgress = getProgress(levels);

  const handleSelectProfile = (profile) => {
    const profileLevels = Array.isArray(profile.levels) ? profile.levels : getDefaultLevels();
    setActiveProfile({ ...profile, levels: profileLevels, lastPlayedAt: Date.now() });
    setLevels(profileLevels);
    setCurrentLevel(null);
    setHintVisible(false);
    setInfoExpanded(false);
    setPinStates({ 13: false });
    setIsSimulating(false);
    setView('map');
    touchProfile(profile.id);
  };

  const handleCreateProfile = ({ name, avatar }) => {
    const nextProfile = createProfile(name, avatar);
    handleSelectProfile(nextProfile);
  };

  const handleDeleteProfile = (profileId) => {
    deleteProfile(profileId);
    if (activeProfile?.id === profileId) {
      setActiveProfile(null);
      setLevels(getDefaultLevels());
      setCurrentLevel(null);
      setView('landing');
    }
  };

  const handleResetProfile = (profileId) => {
    resetProfileProgress(profileId);
    if (activeProfile?.id === profileId) {
      setLevels(getDefaultLevels());
      setCurrentLevel(null);
      setView('map');
    }
  };

  const handleChangePin = (currentPin, nextPin) => {
    if (currentPin !== appData.teacherPin) {
      return { ok: false, message: 'El PIN actual es incorrecto.' };
    }
    try {
      updateTeacherPin(nextPin);
      return { ok: true, message: 'PIN actualizado correctamente.' };
    } catch (error) {
      return { ok: false, message: error.message || 'No se pudo cambiar el PIN.' };
    }
  };

  const handleImportData = async (file) => {
    await importJSON(file);
    setActiveProfile(null);
    setLevels(getDefaultLevels());
    setCurrentLevel(null);
    setView('landing');
    setPinModalOpen(false);
  };

  const handleValidateTeacherPin = async (pin) => {
    if (pin !== appData.teacherPin) {
      return false;
    }
    setPinModalOpen(false);
    setView('teacher');
    return true;
  };

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    const freshProfile = profiles.find((profile) => profile.id === activeProfile.id);
    if (!freshProfile) {
      setActiveProfile(null);
      setLevels(getDefaultLevels());
      setCurrentLevel(null);
      setView('landing');
      return;
    }

    setActiveProfile(freshProfile);
    setLevels(freshProfile.levels);
    setCurrentLevel((previousLevel) => {
      if (!previousLevel) {
        return previousLevel;
      }
      return freshProfile.levels.find((level) => level.id === previousLevel.id) || null;
    });
  }, [profiles, activeProfile?.id]);

  useEffect(() => {
    if ((view === 'map' || view === 'editor') && !activeProfile) {
      setView('landing');
    }
  }, [view, activeProfile]);

  // Handle Serial Operations
  const openPort = async (port) => {
    try {
      await port.open({ baudRate: 9600 });
      const encoder = new TextEncoderStream();
      encoder.readable.pipeTo(port.writable);
      serialWriter.current = encoder.writable.getWriter();
      serialPort.current = port;
      setIsConnected(true);
      setActiveModal(null);
    } catch (e) {
      console.error("No se pudo abrir el puerto:", e);
      setIsConnected(false);
    }
  };

  const connectKit = async () => {
    if (!navigator.serial) {
      alert("Tu navegador no soporta la conexión directa con el kit. ¡Prueba usando Chrome o Edge!");
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await openPort(port);
    } catch (e) {
      console.error("Selección de puerto cancelada");
    }
  };

  const disconnectKit = async () => {
    if (serialPort.current) {
      if (serialWriter.current) {
        await serialWriter.current.releaseLock();
        serialWriter.current = null;
      }
      await serialPort.current.close();
      serialPort.current = null;
      setIsConnected(false);
    }
  };

  // Auto-Connect and Event Listeners
  useEffect(() => {
    if (!navigator.serial) return;

    const handleAutoConnect = async () => {
      try {
        const ports = await navigator.serial.getPorts();
        if (ports.length > 0) {
          // Try to connect to the first authorized port
          await openPort(ports[0]);
        }
      } catch (err) {
        console.warn("Auto-connect falló:", err);
      }
    };

    handleAutoConnect();

    const onConnect = (e) => handleAutoConnect();
    const onDisconnect = (e) => {
      setIsConnected(false);
      serialPort.current = null;
    };

    navigator.serial.addEventListener('connect', onConnect);
    navigator.serial.addEventListener('disconnect', onDisconnect);

    return () => {
      if (navigator.serial) {
        navigator.serial.removeEventListener('connect', onConnect);
        navigator.serial.removeEventListener('disconnect', onDisconnect);
      }
    };
  }, []);

  const sendSerial = async (data) => {
    if (serialWriter.current) {
      try {
        await serialWriter.current.write(data);
      } catch (e) {
        console.error("Error enviando datos:", e);
        setIsConnected(false);
      }
    }
  };

  const completeLevel = (id) => {
    setLevels(prev => prev.map(l => {
      if (l.id === id) return { ...l, completed: true };
      if (l.id === id + 1) return { ...l, locked: false };
      return l;
    }));
  };

  const requestAiHint = useCallback(async (trigger = 'auto') => {
    if (!workspace.current || !currentLevel || isHintLoading) return;

    if (trigger === 'manual' && Date.now() - lastManualHintTime < 15000) {
      setAiEmoji('⏳');
      setAiHint('¡Dame un segundito! Estoy buscando la mejor pista para ti.');
      setHintVisible(true);
      return;
    }

    setHintVisible(true);
    setIsHintLoading(true);

    try {
      const serializedTree = serializeWorkspace(workspace.current);
      const score = getMissionProgressScore(workspace.current, currentLevel.target);
      
      const contextSummary = buildContextSummary({
        serializedTree,
        currentLevel,
        isConnected,
        pinStates
      });

      const systemPrompt = getKidsSystemPrompt();
      const userPrompt = buildKidsUserPrompt({
        levelTitle: currentLevel.title,
        levelRiddle: currentLevel.riddle,
        targetBlock: currentLevel.target,
        progressScore: score,
        contextSummary
      });

      const result = await getMissionHint({ systemPrompt, userPrompt });
      setAiHint(result.hint);
      setAiEmoji(result.emoji);
      setHintRequested(true);

      if (trigger === 'manual') setLastManualHintTime(Date.now());
      
      // Auto-hide after some time if it was an auto-hint
      if (trigger === 'auto') {
        setTimeout(() => setHintVisible(false), 20000);
      }
    } catch (err) {
      console.error(err);
      setAiHint("¡Ups! He tenido un pequeño cortocircuito. Revisa tus bloques, ¡seguro que lo logras!");
    } finally {
      setIsHintLoading(false);
    }
  }, [currentLevel, isConnected, pinStates, isHintLoading, lastManualHintTime]);

  // Blockly Initialization
  const injectBlockly = () => {
    if (!blocklyDiv.current || !currentLevel) return;
    
    try {
      if (workspace.current) workspace.current.dispose();

      const toolboxBlocks = [
        { type: 'arduino_led_on', kind: 'block' },
        { type: 'arduino_led_off', kind: 'block' },
        { type: 'arduino_wait', kind: 'block' },
        { type: 'controls_if', kind: 'block' },
        { type: 'logic_compare', kind: 'block' },
        { type: 'logic_boolean', kind: 'block' }
      ].filter(b => currentLevel.allowedBlocks.includes(b.type));

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: { kind: 'flyoutToolbox', contents: toolboxBlocks },
        grid: { spacing: 25, length: 3, colour: '#eee', snap: true },
        trashcan: true,
        move: { scrollbars: false, drag: true, wheel: true },
        zoom: { controls: true, wheel: true, startScale: 1.6 },
        theme: Blockly.Themes.Classic
      });

      const defaultXml = `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="arduino_setup" x="120" y="60" deletable="false" movable="true"></block>
          <block type="arduino_loop" x="120" y="240" deletable="false" movable="true"></block>
        </xml>
      `;
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(defaultXml), workspace.current);
      Blockly.svgResize(workspace.current);
      
      workspace.current.addChangeListener((event) => {
        const trackableEvents = new Set([
          Blockly.Events.BLOCK_CREATE,
          Blockly.Events.BLOCK_DELETE,
          Blockly.Events.BLOCK_MOVE,
          Blockly.Events.BLOCK_CHANGE
        ]);

        if (event.isUiEvent || !trackableEvents.has(event.type)) return;

        setLastProgressTime(Date.now());
        setHintRequested(false);
      });

      // Center the view on the blocks to make it easy for children
      setTimeout(() => {
        if (workspace.current) {
          workspace.current.scrollCenter();
        }
      }, 50);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (view === 'editor') {
      setInfoExpanded(true);
      setLastProgressTime(Date.now());
      setHintRequested(false);
      setAiHint('¡Dime si te quedas atascado!');
      setAiEmoji('👋');
      const tid = setTimeout(injectBlockly, 500);
      return () => {
        clearTimeout(tid);
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, [view, currentLevel]);

  useEffect(() => {
    if (view !== 'editor' || !currentLevel) return;

    const inactivityId = setInterval(() => {
      if (!workspace.current || isHintLoading || hintRequested) return;
      if (Date.now() - lastProgressTime < 60000) return;

      const score = getMissionProgressScore(workspace.current, currentLevel.target);
      if (score >= 1) return; // Mission looks solved already

      requestAiHint('auto');
    }, 10000);

    return () => clearInterval(inactivityId);
  }, [view, currentLevel, lastProgressTime, isHintLoading, hintRequested, requestAiHint]);

  const executeBlock = async (block) => {
    const type = block.type;
    if (type === 'arduino_led_on') {
      setPinStates({ 13: true });
      await sendSerial("H13");
      await new Promise(r => setTimeout(r, 400));
    } else if (type === 'arduino_led_off') {
      setPinStates({ 13: false });
      await sendSerial("L13");
      await new Promise(r => setTimeout(r, 400));
    } else if (type === 'arduino_wait') {
      const seconds = parseFloat(block.getFieldValue('SECONDS')) || 1;
      await new Promise(r => setTimeout(r, seconds * 1000));
    }
  };

  const runCode = async () => {
    if (!workspace.current) return;
    
    setIsSimulating(true);
    // Force reset simulation state for a clean preview run
    setRunId(prev => prev + 1);
    setPinStates({ 13: false });
    
    // Give React time to mount the new scene with the reset state
    await new Promise(r => setTimeout(r, 50));
    
    // Reset hardware if connected
    if (isConnected && serialWriter.current) {
      await sendSerial("L13");
      await new Promise(r => setTimeout(r, 200));
    }
    
    const allBlocks = workspace.current.getAllBlocks(false);
    const setupBlock = allBlocks.find(b => b.type === 'arduino_setup');
    const loopBlock = allBlocks.find(b => b.type === 'arduino_loop');

    let missionSuccess = false;
    try {
      if (setupBlock) {
        let block = setupBlock.getInputTargetBlock('STACK');
        while (block) {
          if (block.type === currentLevel.target) missionSuccess = true;
          await executeBlock(block);
          block = block.getNextBlock();
        }
      }
      if (loopBlock) {
        // Para simulación, repetimos el loop 3 veces para que se vea el efecto
        for (let i = 0; i < 3; i++) {
          let block = loopBlock.getInputTargetBlock('STACK');
          while (block) {
            if (block.type === currentLevel.target) missionSuccess = true;
            await executeBlock(block);
            block = block.getNextBlock();
          }
        }
      }
    } catch (err) {
      console.error("Error during simulation:", err);
    } finally {
      setIsSimulating(false);
      // Optional: reset pinStates after simulation to ensure things return to "idle"
      setPinStates({ 13: false });
    }
    
    setTimeout(() => {
      setActiveModal(missionSuccess ? 'success' : 'error');
      if (missionSuccess) completeLevel(currentLevel.id);
    }, 800);
  };

  const generateArduinoCode = () => {
    if (!workspace.current) return "";
    const allBlocks = workspace.current.getAllBlocks(false);
    const setupBlock = allBlocks.find(b => b.type === 'arduino_setup');
    const loopBlock = allBlocks.find(b => b.type === 'arduino_loop');

    let setupCode = "void setup() {\n  Serial.begin(9600);\n  pinMode(13, OUTPUT);\n";
    let loopCode = "void loop() {\n";

    const getBlockValue = (block) => {
      if (!block) return "true";
      if (block.type === 'logic_boolean') {
        return block.getFieldValue('BOOL').toLowerCase();
      } else if (block.type === 'logic_compare') {
        const op = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' }[block.getFieldValue('OP')] || '==';
        const left = getBlockValue(block.getInputTargetBlock('A'));
        const right = getBlockValue(block.getInputTargetBlock('B'));
        return `(${left} ${op} ${right})`;
      } else if (block.type === 'math_number') {
        return block.getFieldValue('NUM');
      }
      return "true";
    };

    const getBlockCode = (block) => {
      let code = "";
      while (block) {
        if (block.type === 'arduino_led_on') {
          code += '  digitalWrite(13, HIGH);\n';
        } else if (block.type === 'arduino_led_off') {
          code += '  digitalWrite(13, LOW);\n';
        } else if (block.type === 'arduino_wait') {
          const seconds = parseFloat(block.getFieldValue('SECONDS')) || 1;
          code += `  delay(${seconds * 1000});\n`;
        } else if (block.type === 'controls_if') {
          let condition = getBlockValue(block.getInputTargetBlock('IF0'));
          code += `  if (${condition}) {\n`;
          code += getBlockCode(block.getInputTargetBlock('DO0'));
          code += `  }\n`;
        }
        block = block.getNextBlock();
      }
      return code;
    };

    if (setupBlock) {
      setupCode += getBlockCode(setupBlock.getInputTargetBlock('STACK'));
    }
    if (loopBlock) {
      loopCode += getBlockCode(loopBlock.getInputTargetBlock('STACK'));
    }

    setupCode += "}\n\n";
    loopCode += "}\n";

    const finalCode = setupCode + loopCode;
    console.log("Generando código Arduino:\n", finalCode);
    setGeneratedCode(finalCode);
    return finalCode;
  };

  const showCodePreview = () => {
    if (!showCodeInSim) {
      generateArduinoCode();
    }
    setShowCodeInSim(!showCodeInSim);
  };

  const uploadToArduino = async () => {
    const code = generateArduinoCode();
    if (!code) return;

    // IMPORTANTE: Cerramos la conexión "en vivo" del navegador si existe,
    // porque si el navegador tiene el puerto abierto, arduino-cli no puede usarlo (Acceso denegado).
    if (isConnected) {
      console.log("Desconectando modo en vivo para permitir la subida...");
      await disconnectKit();
      // Pequeña espera para que el OS libere el puerto
      await new Promise(r => setTimeout(r, 500));
    }
    
    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.details && data.details.includes("Acceso denegado")) {
           alert("Error: El puerto está ocupado. Asegúrate de que el 'KitBot' esté durmiendo (Desconectado) y no tengas el Monitor Serie abierto en otro programa.");
        } else {
           alert("Error: " + (data.error || 'Fallo de compilación'));
        }
      } else {
        alert("¡Código subido a la placa con éxito! Tu arduino ahora se ejecutará solo.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión con el backend local. Asegúrate de iniciar 'npm run dev' en la carpeta backend.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
      {!ready ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'var(--font-playful)', fontSize: '1.3rem', color: '#4b4b4b' }}>
          Cargando perfiles...
        </div>
      ) : (
        <>
      
      {/* Header with KitBot */}
      <nav className="glass" style={{ 
        height: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 40px',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '2px solid #e5e5e5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--primary)', padding: '10px 14px', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '1.4rem', boxShadow: '0 4px 0 #0284c7' }}>HB!</div>
          <h2 style={{ color: 'var(--secondary)', fontSize: '1.5rem', letterSpacing: '-1px', fontWeight: 900 }}>HELLO, BLOCKS! <span style={{ color: 'var(--primary)', fontSize: '0.8rem', verticalAlign: 'middle', marginLeft: '5px' }}>KIDS</span></h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {(view === 'map' || view === 'editor') && (
            <KitBotAssistant isConnected={isConnected} onClick={() => isConnected ? disconnectKit() : setActiveModal('kit-wizard')} />
          )}

          {activeProfile && (view === 'map' || view === 'editor') && (
            <div className="active-profile-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '6px 16px 6px 8px', borderRadius: '30px', border: '2px solid #e2e8f0' }}>
              <span className="active-profile-avatar" style={{ fontSize: '1.5rem', background: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{activeAvatar?.emoji}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1 }}>{activeProfile.name}</strong>
                <small style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>{activeProgress.completed}/{activeProgress.total} misiones</small>
              </div>
            </div>
          )}

          {activeProfile && (view === 'map' || view === 'editor') && (
            <button
              type="button"
              className="secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => {
                setCurrentLevel(null);
                setHintVisible(false);
                setInfoExpanded(false);
                setView('landing');
              }}
            >
              Cambiar perfil
            </button>
          )}

          {view === 'landing' && (
            <div className="device-profile-count" style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Perfiles guardados: {profiles.length}/{MAX_PROFILES}
            </div>
          )}

          {view === 'teacher' && (
            <button
              type="button"
              className="secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setView('landing')}
            >
              <ArrowLeft size={16} />
              Salir del panel
            </button>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, position: 'relative' }}>
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="view-container">
              <LandingPage
                profiles={profiles}
                maxProfiles={MAX_PROFILES}
                onCreateProfile={handleCreateProfile}
                onSelectProfile={handleSelectProfile}
                onOpenTeacher={() => setPinModalOpen(true)}
              />
            </motion.div>
          )}

          {view === 'teacher' && (
            <motion.div key="teacher" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="view-container">
              <TeacherDashboard
                profiles={profiles}
                maxProfiles={MAX_PROFILES}
                onBack={() => setView('landing')}
                onResetProfile={handleResetProfile}
                onDeleteProfile={handleDeleteProfile}
                onChangePin={handleChangePin}
                onExport={exportJSON}
                onImport={handleImportData}
              />
            </motion.div>
          )}

          {view === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="view-container">
              <LevelMap onSelectLevel={(level) => { setCurrentLevel(level); setView('editor'); }} levels={levels} />
            </motion.div>
          )}

          {view === 'editor' && currentLevel && (
            <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: '#fff' }}>
              
              {/* Top Bar for Editor */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: 'white', borderBottom: '2px solid #e5e5e5', position: 'relative', zIndex: 9999 }}>
                
                {infoExpanded && (
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                    onClick={() => setInfoExpanded(false)}
                  />
                )}

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <button onClick={() => setView('map')} style={{ background: '#f8f9fa', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#afafaf', fontSize: '0.75rem', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer' }}>
                    <ArrowLeft size={14} /> MAPA
                  </button>
                  
                  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
                    <button onClick={() => setInfoExpanded(!infoExpanded)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #0284c7' }}>
                      <HelpCircle size={20} /> MISIÓN: {currentLevel?.title} {infoExpanded ? '▲' : '▼'}
                    </button>
                    
                    <AnimatePresence>
                      {infoExpanded && (
                        <>
                          <div
                            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                            onClick={() => setInfoExpanded(false)}
                          />
                          <motion.div initial={{ opacity: 0, y: -10, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -10, x: "-50%" }} style={{ position: 'absolute', top: 'calc(100% + 15px)', left: '50%', width: '550px', background: 'white', border: '4px solid var(--secondary)', borderRadius: '32px', padding: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)', zIndex: 9999 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                              <div style={{ background: 'var(--primary)', color: 'white', minWidth: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 4px 0 #0284c7' }}>
                                {currentLevel?.id}
                              </div>
                              <h3 style={{ fontFamily: 'var(--font-playful)', fontSize: '2rem', color: 'var(--secondary)', margin: 0, lineHeight: 1.1 }}>
                                {currentLevel?.id === 1 ? '¡El Barco en la Niebla! 🚢' : currentLevel?.id === 2 ? '¡Señales de Alerta! 🚁' : '¡Despegue de Emergencia! 🚁'}
                              </h3>
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '24px', border: '3px dashed #cbd5e1', marginBottom: '25px' }}>
                              <p style={{ fontFamily: 'var(--font-playful)', color: '#334155', fontSize: '1.3rem', lineHeight: 1.4, margin: 0 }}>
                                {currentLevel?.riddle}
                              </p>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <MissionStatus pinStates={pinStates} isConnected={isConnected} />
                            </div>
                            
                            <button className="primary" style={{ width: '100%', padding: '16px', fontSize: '1.3rem', marginTop: '20px' }} onClick={() => setInfoExpanded(false)}>
                              ¡ENTENDIDO, A PROGRAMAR! 🚀
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button className="outline-dark" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={uploadToArduino} disabled={isUploading}>
                    {isUploading ? <RotateCcw className="animate-spin" size={20} /> : <Cpu size={20} />} 
                    {isUploading ? 'SUBIENDO...' : 'CARGAR A PLACA'}
                  </button>
                  <button className="primary" style={{ padding: '12px 30px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={runCode}>
                    <Play size={24} /> EMPEZAR RETO
                  </button>
                </div>
              </div>

              {/* Split Work Region */}
              <div style={{ flex: 1, display: 'flex', background: '#fcfcfc', position: 'relative' }}>
                
                {/* Blockly Area */}
                <div style={{ flex: 3, position: 'relative' }}>
                  <div ref={blocklyDiv} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                </div>

                {/* Simulator Area */}
                <div style={{ flex: 2, background: showCodeInSim ? '#1e293b' : '#e0f2fe', position: 'relative', zIndex: 1 }}>
                  <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 50 }}>
                    <button className="glass outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', width: '45px', height: '45px', borderRadius: '12px', background: showCodeInSim ? '#334155' : 'white', border: showCodeInSim ? '2px solid #475569' : '2px solid #e2e8f0', boxShadow: showCodeInSim ? '0 4px 0 #1e293b' : '0 4px 0 #e2e8f0' }} onClick={showCodePreview} title={showCodeInSim ? "Ocultar Código" : "Ver el Código del Inventor"}>
                      {showCodeInSim ? <EyeOff size={22} color="#94a3b8" /> : <Code size={22} color="#0ea5e9" />}
                    </button>
                  </div>
                  {showCodeInSim ? (
                    <div style={{ padding: '80px 40px 40px', height: '100%', overflowY: 'auto' }}>
                      <h3 style={{ color: '#38bdf8', fontFamily: 'var(--font-playful)', fontSize: '2rem', marginBottom: '20px' }}>Código del Inventor 🤖</h3>
                      <pre style={{ color: '#f8fafc', fontSize: '1.1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {generatedCode}
                      </pre>
                    </div>
                  ) : currentLevel?.id >= 2 ? (
                    <HelicopterScene key={`heli-${runId}`} pinStates={pinStates} isSimulating={isSimulating} />
                  ) : (
                    <LighthouseScene key={`light-${runId}`} pinStates={pinStates} isSimulating={isSimulating} />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {hintVisible && view === 'editor' && currentLevel && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 1999 }}
          onClick={() => setHintVisible(false)}
        />
      )}
      
      {/* Global Mascot Helper */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <AnimatePresence>
          {hintVisible && view === 'editor' && currentLevel && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              style={{ background: 'white', padding: '20px', borderRadius: '24px', borderBottomLeftRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', marginBottom: '15px', border: '3px solid var(--primary)', maxWidth: '280px', pointerEvents: 'auto' }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{isHintLoading ? '🤖 KitBot pensando...' : `${aiEmoji} Pista de KitBot:`}</div>
              <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.4, margin: 0 }}>
                {isHintLoading ? 'Buscando la mejor solución para ti...' : aiHint}
              </p>
              {!isHintLoading && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setHintVisible(false); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer', padding: 0 }}
                >
                  ¡Entendido!
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (view === 'editor') {
              requestAiHint('manual');
            }
          }} 
          style={{ cursor: view === 'editor' ? 'pointer' : 'default', pointerEvents: 'auto' }}
        >
          <CharacterMascot size={120} emotion={isHintLoading ? 'thinking' : hintVisible ? 'excited' : 'happy'} speaking={hintVisible} />
        </motion.div>
      </div>

      {/* Modals Container */}
      <AnimatePresence>
        {activeModal && activeModal !== 'success' && (
          <motion.div key="global-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.4)' }} onClick={() => setActiveModal(null)}>
            
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '40px', textAlign: 'center', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>

              {/* ERROR MODAL */}
              {activeModal === 'error' && (
                <>
                  <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🤔</div>
                  <h2 style={{ fontFamily: 'var(--font-playful)', fontSize: '2.5rem', color: '#ff4b4b', marginBottom: '10px' }}>¡CASI!</h2>
                  <p style={{ fontSize: '1.2rem', color: '#777', marginBottom: '30px' }}>Algo no ha salido bien. ¿Quieres ver una pista de KitBot?</p>
                  <button className="primary" style={{ width: '100%', background: '#ff4b4b', boxShadow: '0 4px 0 #cc0000', marginBottom: '10px' }} onClick={() => setActiveModal(null)}>REVISAR BLOQUES</button>
                  <button style={{ color: '#999', fontWeight: 'bold', background: 'none', border: 'none' }} onClick={() => { setActiveModal(null); setHintVisible(true); }}>SÍ, NECESITO UNA PISTA 💡</button>
                </>
              )}

              {/* KIT WIZARD (KID VERSION) */}
              {activeModal === 'kit-wizard' && (
                <>
                  <div style={{ fontSize: '6rem', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Monitor size={80} color="#1cb0f6" /></motion.div>
                    <Link size={40} color="#ccc" style={{ alignSelf: 'center' }} />
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Cpu size={80} color="#0ea5e9" /></motion.div>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-playful)', fontSize: '2.2rem', color: 'var(--secondary)', marginBottom: '15px' }}>¡Despierta a KitBot!</h2>
                  <p style={{ fontSize: '1.1rem', color: '#777', marginBottom: '30px', lineHeight: 1.5 }}>Conecta el cable de tu Kit Cirkids al ordenador y pulsa el botón mágico para empezar a jugar.</p>
                  
                  <button className="primary" style={{ width: '100%', padding: '25px', fontSize: '1.4rem' }} onClick={connectKit}>
                    ¡PULSAR BOTÓN MÁGICO! ✨
                  </button>
                  
                  <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                     <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', color: '#bbb', fontSize: '0.8rem', textDecoration: 'underline' }}>Cerrar</button>
                  </div>
                </>
              )}

              {/* CODE PREVIEW MODAL */}
              {activeModal === 'code-preview' && (
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--secondary)', fontFamily: 'var(--font-playful)' }}>Código del Inventor 🤖</h3>
                  <p style={{ fontSize: '1rem', color: '#666', marginBottom: '15px' }}>Este es el código que el robot entiende. Así es como se ve por dentro:</p>
                  <div style={{ position: 'relative' }}>
                    <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '20px', borderRadius: '15px', fontSize: '0.9rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '25px', fontFamily: 'monospace', border: '4px solid #334155' }}>
                      {generatedCode}
                    </pre>
                  </div>
                  <button className="primary" style={{ width: '100%', padding: '20px', fontSize: '1.2rem' }} onClick={() => setActiveModal(null)}>VOLVER AL EDITOR</button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Completion Modal */}
      <CompletionModal 
        isOpen={activeModal === 'success'}
        missionTitle={currentLevel?.title || 'Misión Superada'}
        completionMessage="Has superado el reto como un auténtico inventor. ¡Increíble! 🎉"
        stars={3}
        onNext={() => { setActiveModal(null); setView('map'); }}
        onRetry={() => { setActiveModal(null); }}
      />

      {pinModalOpen && (
        <PinModal
          onClose={() => setPinModalOpen(false)}
          onValidate={handleValidateTeacherPin}
        />
      )}
      </>
      )}
    </div>
  );
}
