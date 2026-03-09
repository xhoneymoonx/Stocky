const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CAIXA_FILE = path.join(DATA_DIR, 'caixa.json');
const LOGS_CAIXA_FILE = path.join(DATA_DIR, 'logs-caixa.json');

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

function getSaldo() {
  return readJSON(CAIXA_FILE, { sujo: 0, limpo: 0 });
}

function adicionarCaixa(tipo, valor) {
  const caixa = getSaldo();
  caixa[tipo] += valor;
  writeJSON(CAIXA_FILE, caixa);
  return caixa;
}

function retirarCaixa(tipo, valor) {
  const caixa = getSaldo();
  if (caixa[tipo] < valor) {
    return { sucesso: false, motivo: `Saldo insuficiente. Disponível: **$${caixa[tipo].toLocaleString('pt-BR')}**` };
  }
  caixa[tipo] -= valor;
  writeJSON(CAIXA_FILE, caixa);
  return { sucesso: true, saldo: caixa };
}

function addLogCaixa(entrada) {
  const logs = readJSON(LOGS_CAIXA_FILE, []);
  logs.unshift({ ...entrada, timestamp: new Date().toISOString() });
  if (logs.length > 500) logs.splice(500);
  writeJSON(LOGS_CAIXA_FILE, logs);
}

function getLogsCaixa() {
  return readJSON(LOGS_CAIXA_FILE, []);
}

module.exports = { getSaldo, adicionarCaixa, retirarCaixa, addLogCaixa, getLogsCaixa };