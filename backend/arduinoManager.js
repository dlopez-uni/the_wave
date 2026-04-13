import fs from 'fs';
import path from 'path';
import https from 'https';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.join(__dirname, 'bin');

// Detect OS and Arch
const platform = os.platform(); // 'darwin', 'win32', 'linux'
const arch = os.arch(); // 'x64', 'arm64'

let binaryName = 'arduino-cli';
let downloadUrl = '';

if (platform === 'win32') {
  binaryName = 'arduino-cli.exe';
  downloadUrl = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip';
} else if (platform === 'darwin') {
  // macOS
  const archString = arch === 'arm64' ? 'macOS_ARM64' : 'macOS_64bit';
  downloadUrl = `https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_${archString}.tar.gz`;
  // tar.gz needs different extraction than zip, but let's see if we can get a zip or handle it.
  // Actually, Arduino provides .tar.gz for Mac/Linux. AdmZip might not handle .tar.gz easily.
} else if (platform === 'linux') {
  const archString = arch === 'arm64' ? 'Linux_ARM64' : 'Linux_64bit';
  downloadUrl = `https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_${archString}.tar.gz`;
}

const CLI_PATH = path.join(BIN_DIR, binaryName);
const DOWNLOAD_PATH = path.join(BIN_DIR, downloadUrl.endsWith('.zip') ? 'arduino-cli.zip' : 'arduino-cli.tar.gz');

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

  if (!fs.existsSync(CLI_PATH)) {
    console.log(`No se encontró arduino-cli. Detectado ${platform} ${arch}. Descargando...`);
    // For simplicity in this environment, if it's Mac and we have a hard time with tar.gz in JS, 
    // we could try to use the system 'tar' command.
    await downloadFile(downloadUrl, DOWNLOAD_PATH);
    console.log("Descarga completada. Extrayendo...");
    
    if (DOWNLOAD_PATH.endsWith('.zip')) {
      const zip = new AdmZip(DOWNLOAD_PATH);
      zip.extractAllTo(BIN_DIR, true);
    } else {
      // Use system tar for .tar.gz
      await runCommand(`tar -xzf "${DOWNLOAD_PATH}" -C "${BIN_DIR}"`);
    }
    
    if (fs.existsSync(DOWNLOAD_PATH)) {
      fs.unlinkSync(DOWNLOAD_PATH);
    }

    // Set permissions for Unix
    if (platform !== 'win32') {
      await runCommand(`chmod +x "${CLI_PATH}"`);
    }

    console.log("arduino-cli instalado en", CLI_PATH);
  } else {
    console.log("arduino-cli ya está instalado.");
  }

  try {
    console.log("Actualizando índice de cores...");
    await runCommand(`"${CLI_PATH}" core update-index`);
    
    console.log("Instalando core arduino:avr...");
    await runCommand(`"${CLI_PATH}" core install arduino:avr`);
    console.log("¡Arduino CLI listo para usar!");
  } catch (error) {
    console.error("Fallo al actualizar el core. El CLI está instalado pero algo falló:", error.message);
  }
}

export function getCliPath() {
  return CLI_PATH;
}
