const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BAU_MEMBROS_FILE = path.join(DATA_DIR, 'bau-membros.json');
const BAU_GERENCIA_FILE = path.join(DATA_DIR, 'bau-gerencia.json');
const ITEMS_FILE = path.join(DATA_DIR, 'items-membros.json');
const ITEMS_GERENCIA_FILE = path.join(DATA_DIR, 'items-gerencia.json');
const LOGS_MEMBROS_FILE = path.join(DATA_DIR, 'logs-membros.json');
const LOGS_GERENCIA_FILE = path.join(DATA_DIR, 'logs-gerencia.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const CATALOGO_PADRAO = {
  medicamentos: {
    nome: "Medicamentos", emoji: "💊",
    items: [
      { id: "bandagem", nome: "Bandagem", emoji: "🩹" },
      { id: "gaze", nome: "Gaze", emoji: "🩻" },
      { id: "adrenalina", nome: "Adrenalina", emoji: "💉" }
    ]
  },
  armas: {
    nome: "Armas", emoji: "🔫",
    items: [
      { id: "colt", nome: "Colt", emoji: "🔫" },
      { id: "usp", nome: "USP", emoji: "🔫" },
      { id: "desert", nome: "Desert Eagle", emoji: "🔫" }
    ]
  },
  coletesemuni: {
    nome: "Coletes e Munição", emoji: "🦺",
    items: [
      { id: "colete", nome: "Colete", emoji: "🦺" },
      { id: "colete_danificado", nome: "Colete Danificado", emoji: "🪖" },
      { id: "muni_9mm", nome: "Munição 9MM", emoji: "🔶" },
      { id: "muni_45acp", nome: "Munição .45 ACP", emoji: "🟠" },
      { id: "muni_50", nome: "Munição .50", emoji: "🔴" }
    ]
  },
  materiais: {
    nome: "Materiais", emoji: "🪛",
    items: [
      { id: "laptop", nome: "Laptop", emoji: "💻" },
      { id: "caixa_polvora", nome: "Caixa de Pólvora", emoji: "📦" },
      { id: "sulfato_bario", nome: "Sulfato de Bário", emoji: "🧪" },
      { id: "alcool_gel", nome: "Álcool em Gel", emoji: "🧴" },
      { id: "sabonete", nome: "Sabonete", emoji: "🧼" },
      { id: "pecas_roupas", nome: "Peças de Roupas", emoji: "👕" },
      { id: "kit_eletronico", nome: "Kit Eletrônico", emoji: "💡" },
      { id: "cobre", nome: "Cobre", emoji: "🟤" },
      { id: "plastico", nome: "Plástico", emoji: "🧱" },
      { id: "sucata_metal", nome: "Sucata de Metal", emoji: "🔩" },
      { id: "aluminio", nome: "Alumínio", emoji: "⚙️" },
      { id: "borracha", nome: "Borracha", emoji: "⚫" }
    ]
  },
  drogas: {
    nome: "Drogas", emoji: "🌿",
    items: [
      { id: "cocaina", nome: "Cocaína", emoji: "❄️" },
      { id: "lsd", nome: "LSD", emoji: "🔮" },
      { id: "meta", nome: "Meta", emoji: "💎" }
    ]
  }
};

const CATALOGO_GERENCIA_PADRAO = {
  armas: {
    nome: "Armas e Munição", emoji: "🔫",
    items: [
      { id: "colt", nome: "Colt", emoji: "🔫" },
      { id: "usp", nome: "USP", emoji: "🔫" },
      { id: "desert", nome: "Desert Eagle", emoji: "🔫" },
      { id: "muni_9mm", nome: "Munição 9MM", emoji: "🔶" },
      { id: "muni_45acp", nome: "Munição .45 ACP", emoji: "🟠" },
      { id: "muni_50ae", nome: "Munição .50 AE", emoji: "🔴" }
    ]
  },
  drogas: {
    nome: "Drogas", emoji: "🌿",
    items: [
      { id: "meta", nome: "Meta", emoji: "💎" },
      { id: "lsd", nome: "LSD", emoji: "🔮" }
    ]
  },
  extras: {
    nome: "Extras", emoji: "📦",
    items: [
      { id: "fichas_cassino", nome: "Fichas de Cassino", emoji: "🎰" },
      { id: "pecas_roupas", nome: "Peças de Roupas", emoji: "👕" },
      { id: "colete", nome: "Colete", emoji: "🦺" },
      { id: "agulha", nome: "Agulha", emoji: "🪡" },
      { id: "linha", nome: "Linha", emoji: "🧵" },
      { id: "resina", nome: "Resina", emoji: "🫙" },
      { id: "tesoura", nome: "Tesoura", emoji: "✂️" }
    ]
  },
  dinheiro: {
    nome: "Dinheiro", emoji: "💰",
    items: [
      { id: "notas_marcadas", nome: "Notas Marcadas", emoji: "💵" }
    ]
  }
};

// ─── BAÚ ─────────────────────────────────────────────────────────────────────

function getBau(tipo) {
  return readJSON(tipo === 'gerencia' ? BAU_GERENCIA_FILE : BAU_MEMBROS_FILE, {});
}

function adicionarAoBau(tipo, categoriaId, itemId, quantidade, nomeItem, nomeCategoria, emojiItem) {
  const file = tipo === 'gerencia' ? BAU_GERENCIA_FILE : BAU_MEMBROS_FILE;
  const bau = readJSON(file, {});
  const key = `${categoriaId}:${itemId}`;
  if (!bau[key]) {
    bau[key] = { nome: nomeItem, categoria: nomeCategoria, categoriaId, quantidade: 0, emoji: emojiItem };
  }
  bau[key].quantidade += quantidade;
  writeJSON(file, bau);
  return bau[key].quantidade;
}

function removerDoBau(tipo, categoriaId, itemId, quantidade) {
  const file = tipo === 'gerencia' ? BAU_GERENCIA_FILE : BAU_MEMBROS_FILE;
  const bau = readJSON(file, {});
  const key = `${categoriaId}:${itemId}`;
  if (!bau[key]) return { sucesso: false, motivo: 'Item não encontrado no baú.' };
  if (bau[key].quantidade < quantidade) {
    return { sucesso: false, motivo: `Estoque insuficiente. Disponível: **${bau[key].quantidade}**` };
  }
  bau[key].quantidade -= quantidade;
  if (bau[key].quantidade === 0) delete bau[key];
  writeJSON(file, bau);
  return { sucesso: true, novaQtd: bau[key] ? bau[key].quantidade : 0 };
}

function zerarBau(tipo) {
  writeJSON(tipo === 'gerencia' ? BAU_GERENCIA_FILE : BAU_MEMBROS_FILE, {});
}

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────

function getCatalogo(tipo) {
  if (tipo === 'gerencia') return readJSON(ITEMS_GERENCIA_FILE, CATALOGO_GERENCIA_PADRAO);
  return readJSON(ITEMS_FILE, CATALOGO_PADRAO);
}

function getCategorias(tipo) {
  const catalogo = getCatalogo(tipo);
  return Object.entries(catalogo).map(([id, cat]) => ({ id, nome: cat.nome, emoji: cat.emoji }));
}

function getItensDaCategoria(tipo, categoriaId) {
  const catalogo = getCatalogo(tipo);
  return catalogo[categoriaId] ? catalogo[categoriaId].items : [];
}

function adicionarItemAoCatalogo(tipo, categoriaId, itemId, nomeItem, emojiItem) {
  const file = tipo === 'gerencia' ? ITEMS_GERENCIA_FILE : ITEMS_FILE;
  const catalogo = getCatalogo(tipo);
  if (!catalogo[categoriaId]) return { sucesso: false, motivo: 'Categoria não encontrada.' };
  const jaExiste = catalogo[categoriaId].items.find(i => i.id === itemId);
  if (jaExiste) return { sucesso: false, motivo: 'Item já existe nessa categoria.' };
  catalogo[categoriaId].items.push({ id: itemId, nome: nomeItem, emoji: emojiItem });
  writeJSON(file, catalogo);
  return { sucesso: true };
}

function removerItemDoCatalogo(tipo, categoriaId, itemId) {
  const file = tipo === 'gerencia' ? ITEMS_GERENCIA_FILE : ITEMS_FILE;
  const catalogo = getCatalogo(tipo);
  if (!catalogo[categoriaId]) return { sucesso: false, motivo: 'Categoria não encontrada.' };
  const idx = catalogo[categoriaId].items.findIndex(i => i.id === itemId);
  if (idx === -1) return { sucesso: false, motivo: 'Item não encontrado no catálogo.' };
  catalogo[categoriaId].items.splice(idx, 1);
  writeJSON(file, catalogo);
  return { sucesso: true };
}

// ─── LOGS ─────────────────────────────────────────────────────────────────────

function addLog(tipo, entrada) {
  const file = tipo === 'gerencia' ? LOGS_GERENCIA_FILE : LOGS_MEMBROS_FILE;
  const logs = readJSON(file, []);
  logs.unshift({ ...entrada, timestamp: new Date().toISOString() });
  if (logs.length > 500) logs.splice(500);
  writeJSON(file, logs);
}

function getLogs(tipo) {
  const file = tipo === 'gerencia' ? LOGS_GERENCIA_FILE : LOGS_MEMBROS_FILE;
  return readJSON(file, []);
}

module.exports = {
  getBau, adicionarAoBau, removerDoBau, zerarBau,
  getCatalogo, getCategorias, getItensDaCategoria,
  adicionarItemAoCatalogo, removerItemDoCatalogo,
  addLog, getLogs
};