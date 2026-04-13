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
  
  const cli = getCliPath();
  
  // Si no se especifica puerto, intentamos encontrar uno primero
  let uploadPort = port;
  if (!uploadPort) {
    const listRes = await runCommand(`"${cli}" board list --format json`);
    try {
      const data = JSON.parse(listRes.stdout);
      const list = data.detected_ports || [];
      if (list.length > 0) uploadPort = list[0].port.address;
    } catch(e) {
      console.error("List error:", e);
    }
  }
  
  if (!uploadPort) {
    return res.status(400).json({ error: "No se encontró ningún puerto especificado ni conectado automáticamente." });
  }

  console.log(`Compilando y subiendo al puerto ${uploadPort}...`);
  // En arduino-cli, upload automáticamente compila si es necesario, o podemos usar compile --upload
  const { stdout, stderr, error } = await runCommand(`"${cli}" compile --upload -p ${uploadPort} -b ${FQBN} "${SKETCH_DIR}"`);
  
  if (error) {
    console.error("Error subiendo:", stderr);
    return res.status(500).json({ error: "Fallo al subir a la placa", details: stderr });
  }
  
  res.json({ message: "Código subido correctamente", output: stdout });
});

app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
});
