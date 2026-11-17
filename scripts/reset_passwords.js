/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS on purpose: Prisma seeds and node scripts require() it */
// Replaces every password that is not yet a scrypt hash (plain text or the
// old 'hash_seguro_mock') with a new random password, stored hashed.
// The new passwords are written to .local-credentials.txt (gitignored) and
// are NOT printed, so they don't end up in terminal logs.
//
// Usage:   node scripts/reset_passwords.js
// Then open .local-credentials.txt, hand each person their password, and
// delete the file.
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const { hashPassword, isHashedPassword, generatePassword } = require('../src/lib/password');

const prisma = new PrismaClient();
const OUT = path.join(__dirname, '..', '.local-credentials.txt');

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, passwordHash: true } });
  const pending = users.filter((u) => !isHashedPassword(u.passwordHash));

  if (pending.length === 0) {
    console.log('Nenhuma senha legada encontrada. Nada a fazer.');
    return;
  }

  const lines = [
    '# MotoFlow - senhas geradas em ' + new Date().toISOString(),
    '# Entregue a cada usuário e APAGUE este arquivo.',
    '',
  ];
  for (const u of pending) {
    const password = generatePassword();
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: hashPassword(password) } });
    lines.push(`${u.email} (${u.role}): ${password}`);
  }
  // Owner-only file (0600). fchmod also tightens a file left over from an earlier run.
  const fd = fs.openSync(OUT, 'a', 0o600);
  try {
    fs.fchmodSync(fd, 0o600);
    fs.writeSync(fd, lines.join('\n') + '\n');
  } finally {
    fs.closeSync(fd);
  }

  console.log(`${pending.length} senha(s) redefinida(s). Veja ${path.basename(OUT)} (não versionado).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
