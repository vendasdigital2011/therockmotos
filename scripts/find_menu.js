const fs = require('fs');

const content = fs.readFileSync('D:/Claudcoude/projetos/Cassio/altimus-analysis/main.js', 'utf8');

const targets = ['"Geral"', '"Comercial"', '"CRM"', '"Financeiro"', '"Fiscal"', '"Integrador"', '"Avaliação & Serviços"', '"Pendências de Veículos"', '"Veículos"'];

for (const t of targets) {
  let idx = 0;
  let count = 0;
  while ((idx = content.indexOf(t, idx)) !== -1 && count < 5) {
    const start = Math.max(0, idx - 150);
    const end = Math.min(content.length, idx + 400);
    const snippet = content.substring(start, end);
    if (snippet.includes('items') || snippet.includes('label') || snippet.includes('to:') || snippet.includes('command') || snippet.includes('children')) {
      console.log(`=== MATCH FOR ${t} at ${idx} ===`);
      console.log(snippet);
      console.log('\n');
      count++;
    }
    idx += t.length;
  }
}
