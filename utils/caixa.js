const { getDb } = require('./firebase');

async function getSaldo() {
  const db = getDb();
  const doc = await db.collection('caixa').doc('saldo').get();
  return doc.exists ? doc.data() : { sujo: 0, limpo: 0 };
}

async function adicionarCaixa(tipo, valor) {
  const db = getDb();
  const ref = db.collection('caixa').doc('saldo');
  const doc = await ref.get();
  const saldo = doc.exists ? doc.data() : { sujo: 0, limpo: 0 };
  saldo[tipo] += valor;
  await ref.set(saldo);
  return saldo;
}

async function retirarCaixa(tipo, valor) {
  const db = getDb();
  const ref = db.collection('caixa').doc('saldo');
  const doc = await ref.get();
  const saldo = doc.exists ? doc.data() : { sujo: 0, limpo: 0 };
  if (saldo[tipo] < valor) {
    return { sucesso: false, motivo: `Saldo insuficiente. Disponível: **$${saldo[tipo].toLocaleString('pt-BR')}**` };
  }
  saldo[tipo] -= valor;
  await ref.set(saldo);
  return { sucesso: true, saldo };
}

async function addLogCaixa(entrada) {
  const db = getDb();
  await db.collection('caixa').doc('logs').collection('entradas').add({
    ...entrada,
    timestamp: new Date().toISOString()
  });
}

async function getLogsCaixa() {
  const db = getDb();
  const snap = await db.collection('caixa').doc('logs').collection('entradas')
    .orderBy('timestamp', 'desc').limit(10).get();
  return snap.docs.map(d => d.data());
}

module.exports = { getSaldo, adicionarCaixa, retirarCaixa, addLogCaixa, getLogsCaixa };