const fs = require('fs');
const content = fs.readFileSync('D:/Claudcoude/projetos/Cassio/altimus-analysis/main.js', 'utf8');

const terms = ['"/veiculos"', '"/negociacoes"', '"/oportunidades"', '"/titulos-financeiros"'];
for (const term of terms) {
  let idx = 0;
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(`=== MATCH FOR ${term} at ${idx} ===`);
    console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
    console.log('\n');
    idx += term.length;
    break; // just first
  }
}
