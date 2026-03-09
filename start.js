const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
  const config = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    channels: {
      bauMembros: process.env.CH_BAU_MEMBROS,
      bauGerencia: process.env.CH_BAU_GERENCIA,
      logMembros: process.env.CH_LOG_MEMBROS,
      logGerencia: process.env.CH_LOG_GERENCIA,
      inventarioMembros: process.env.CH_INV_MEMBROS,
      inventarioGerencia: process.env.CH_INV_GERENCIA,
      painelGerencia: process.env.CH_PAINEL_GERENCIA,
      caixaGangue: process.env.CH_CAIXA,
      logCaixa: process.env.CH_LOG_CAIXA,
      saldoCaixa: process.env.CH_SALDO_CAIXA
    },
    roles: {
      membro: process.env.ROLE_MEMBRO,
      gerente: process.env.ROLE_GERENTE,
      dono: process.env.ROLE_DONO
    },
    cor: 3447003
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

require('./index.js');