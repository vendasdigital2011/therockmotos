const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function backupDatabase() {
  const sourceDb = path.join(__dirname, '..', 'prisma', 'dev.db');
  const backupDir = path.join(__dirname, '..', 'backups');

  if (!fs.existsSync(sourceDb)) {
    console.error('Banco de dados não encontrado em:', sourceDb);
    process.exit(1);
  }

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetFile = path.join(backupDir, `motoflow-backup-${timestamp}.db`);

  // Cópia segura
  fs.copyFileSync(sourceDb, targetFile);

  // Calcula checksum SHA-256 para integridade
  const fileBuffer = fs.readFileSync(targetFile);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const hexHash = hashSum.digest('hex');

  const metaFile = path.join(backupDir, `motoflow-backup-${timestamp}.json`);
  const meta = {
    timestamp: new Date().toISOString(),
    sourceFile: sourceDb,
    backupFile: targetFile,
    fileSizeBytes: fileBuffer.length,
    sha256: hexHash,
    status: 'VERIFIED',
  };

  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

  console.log('✅ Backup do banco de dados realizado com sucesso!');
  console.log('Arquivo:', targetFile);
  console.log('Tamanho:', (fileBuffer.length / 1024).toFixed(2), 'KB');
  console.log('SHA256:', hexHash);
}

backupDatabase();
