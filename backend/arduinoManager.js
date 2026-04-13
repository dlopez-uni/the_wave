import fs from 'fs';
import path from 'path';
import https from 'https';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.join(__dirname, 'bin');
const CLI_EXE = path.join(BIN_DIR, 'arduino-cli.exe');

const DOWNLOAD_URL = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip';
const ZIP_PATH = path.join(BIN_DIR, 'arduino-cli.zip');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
         console.error(`Error: ${stderr}`);
         reject(error);
      } else {
         resolve(stdout);
      }
    });
  });
}

export async function setupArduinoCli() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  if (!fs.existsSync(CLI_EXE)) {
    console.log("No se encontró arduino-cli. Descargando...");
    await downloadFile(DOWNLOAD_URL, ZIP_PATH);
    console.log("Descarga completada. Extrayendo...");
    
    const zip = new AdmZip(ZIP_PATH);
    zip.extractAllTo(BIN_DIR, true);
    
    if (fs.existsSync(ZIP_PATH)) {
      fs.unlinkSync(ZIP_PATH);
    }
    console.log("arduino-cli instalado en", CLI_EXE);
  } else {
    console.log("arduino-cli ya está instalado.");
  }

  try {
    console.log("Actualizando índice de cores...");
    await runCommand(`"${CLI_EXE}" core update-index`);
    
    console.log("Instalando core arduino:avr...");
    await runCommand(`"${CLI_EXE}" core install arduino:avr`);
    console.log("¡Arduino CLI listo para usar!");
  } catch (error) {
    console.error("Fallo al actualizar el core. El CLI está instalado pero algo falló:", error.message);
  }
}

export function getCliPath() {
  return CLI_EXE;
}
