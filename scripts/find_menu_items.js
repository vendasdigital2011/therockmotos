const fs = require('fs');
const content = fs.readFileSync('D:/Claudcoude/projetos/Cassio/altimus-analysis/main.js', 'utf8');

// Search for the navigation menu array
// Typically in Vue / React / PrimeReact:
// { label: 'Geral', icon: '...', items: [ { label: 'Veículos', to: '/veiculos' }, ... ] }
const regex = /label:\s*["']([^"']+)["'],\s*(?:icon:[^,]+,)?\s*items:\s*\[([^\]]+)\]/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('=== MENU ITEM ===');
  console.log('Label:', match[1]);
  console.log('Items raw:', match[2].substring(0, 300));
}
