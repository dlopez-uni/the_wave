import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupArduinoCli, getCliPath } from './arduinoManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Preparar entorno
setupArduinoCli().catch(err => console.error("Error inicializando Arduino CLI", err));

const FQBN = 'arduino:avr:uno';
const SKETCH_DIR = path.join(__dirname, 'sketch');
const SKETCH_PATH = path.join(SKETCH_DIR, 'sketch.ino');

if (!fs.existsSync(SKETCH_DIR)) {
  fs.mkdirSync(SKETCH_DIR);
}

// Helper para esperar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para ejecutar comandos
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

// Ruta para obtener puertos conectados
app.get('/api/ports', async (req, res) => {
  const cli = getCliPath();
  const { stdout, error } = await runCommand(`"${cli}" board list --format json`);
  if (error) {
    return res.status(500).json({ error: "Error obteniendo la lista de puertos" });
  }
  
  try {
    const data = JSON.parse(stdout);
    const ports = (data.detected_ports || []).map(b => b.port.address);
    res.json(ports);
  } catch(e) {
    console.error("Parse error:", e, stdout);
    res.status(500).json({ error: "Error parseando la salida de arduino-cli" });
  }
});

app.post('/api/compile', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Falta el código C++" });

  fs.writeFileSync(SKETCH_PATH, code);
  
  const cli = getCliPath();
  console.log("Compilando código...");
  const { stdout, stderr, error } = await runCommand(`"${cli}" compile -b ${FQBN} "${SKETCH_DIR}"`);
  
  if (error) {
    console.error("Error de compilación:", stderr);
    return res.status(500).json({ error: "Compilación fallida", details: stderr });
  }
  res.json({ message: "Compilación exitosa", output: stdout });
});

app.post('/api/upload', async (req, res) => {
  const { code, port } = req.body;
  if (!code) return res.status(400).json({ error: "Falta el código C++" });
  
  // Guardamos el código (aunque venga pre-compilado, es más seguro compilar+subir con arduino-cli en un paso)
  fs.writeFileSync(SKETCH_PATH, code);
  
  // Si no se especifica puerto, intentamos encontrar uno primero
  let uploadPort = port;
  let targetFQBN = FQBN;

  const cli = getCliPath();
  const listRes = await runCommand(`"${cli}" board list --format json`);
  
  try {
    const data = JSON.parse(listRes.stdout);
    const list = data.detected_ports || [];
    if (list.length > 0) {
      const bestPort = list[0];
      if (!uploadPort) uploadPort = bestPort.port.address;
      
      // Si la placa es reconocida, usamos su FQBN específico
      if (bestPort.matching_boards && bestPort.matching_boards.length > 0) {
        targetFQBN = bestPort.matching_boards[0].fqbn;
        console.log(`Placa detectada: ${bestPort.matching_boards[0].name} (${targetFQBN})`);
      }
    }
  } catch(e) {
    console.error("Error detectando placa:", e);
  }
  
  if (!uploadPort) {
    return res.status(400).json({ error: "No se encontró ningún puerto especificado ni conectado automáticamente." });
  }

  console.log(`Compilando y subiendo al puerto ${uploadPort} con FQBN ${targetFQBN}...`);
  
  let result;
  let retries = 6;
  
  while (retries > 0) {
    result = await runCommand(`"${cli}" compile --upload -p ${uploadPort} -b ${targetFQBN} "${SKETCH_DIR}"`);
    
    if (!result.error) break;

    const errorMsg = (result.stderr || "").toLowerCase();
    if (errorMsg.includes("access denied") || errorMsg.includes("acceso denegado") || errorMsg.includes("busy")) {
      console.log(`Puerto ocupado (Acceso denegado), reintentando en 2s... (${retries} intentos restantes)`);
      await sleep(2000);
      retries--;
    } else {
      // Si es otro tipo de error (compilación, etc.), no reintentamos
      break;
    }
  }
  
  if (result.error) {
    const errorMsg = (result.stderr || "").toLowerCase();
    
    // Si falla por sincronización y estábamos probando Uno o Nano normal,
    // intentamos con el bootloader antiguo del Nano (muy común en clones).
    if (errorMsg.includes("sync") || errorMsg.includes("timeout") || errorMsg.includes("resp=")) {
      if (targetFQBN === 'arduino:avr:uno' || targetFQBN === 'arduino:avr:nano') {
        const fallbackFQBN = 'arduino:avr:nano:cpu=atmega328old';
        console.log(`Fallo de sincronización. Probando fallback con ${fallbackFQBN}...`);
        result = await runCommand(`"${cli}" compile --upload -p ${uploadPort} -b ${fallbackFQBN} "${SKETCH_DIR}"`);
      }
    }
  }

  if (result.error) {
    console.error("Error subiendo:", result.stderr);
    return res.status(500).json({ error: "Fallo al subir a la placa", details: result.stderr });
  }
  
  res.json({ message: "Código subido correctamente", output: result.stdout });
});

app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
});
