const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedSucesso, embedGerencia, embedInventario } = require('../utils/embeds');
const { getCatalogo, getBau } = require('../utils/db');
const { getDb } = require('../utils/firebase');
const config = require('../config.json');

function rowMenuGerencia() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ger_adicionar_item').setLabel('➕ Adicionar Item').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ger_remover_item').setLabel('➖ Remover Item').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ger_zerar_bau').setLabel('🗑️ Zerar Baú').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ger_ver_logs').setLabel('📋 Ver Logs').setStyle(ButtonStyle.Primary)
  );
}

function rowMenuGerencia2() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ger_ajustar_membros').setLabel('📝 Ajustar Baú Membros').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ger_ajustar_gerencia').setLabel('📝 Ajustar Baú Gerência').setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  type: 'modal',
  customIds: ['ger_modal_ajustar'],

  async execute(interaction, client) {
    const [, tipo] = interaction.customId.split(':');
    const texto = interaction.fields.getTextInputValue('inventario');
    const catalogo = await getCatalogo();
    const bauAtual = await getBau(tipo);
    const novoBau = { ...bauAtual };

    const linhas = texto.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    let atualizados = 0;
    const erros = [];

    for (const linha of linhas) {
      if (!linha.includes(':')) continue;
      const [nomeRaw, qtdRaw] = linha.split(':');
      const nome = nomeRaw.trim();
      const qtd = parseInt(qtdRaw.trim());

      if (isNaN(qtd) || qtd < 0) {
        erros.push(`Quantidade inválida: **${linha}**`);
        continue;
      }

      let encontrado = false;
      for (const [catId, cat] of Object.entries(catalogo)) {
        const item = cat.items.find(i => i.nome.toLowerCase() === nome.toLowerCase());
        if (item) {
          const key = `${catId}__${item.id}`;
          if (qtd === 0) {
            delete novoBau[key];
          } else {
            novoBau[key] = { nome: item.nome, categoria: cat.nome, categoriaId: catId, quantidade: qtd };
          }
          atualizados++;
          encontrado = true;
          break;
        }
      }

      if (!encontrado) erros.push(`Item não encontrado: **${nome}**`);
    }

    const db = getDb();
    await db.collection('bau').doc(tipo).set(novoBau);

    const canalInvId = tipo === 'gerencia' ? config.channels.inventarioGerencia : config.channels.inventarioMembros;
    const canalInv = client.channels.cache.get(canalInvId);
    if (canalInv) {
      const inventarioEmbed = await embedInventario(novoBau, tipo);
      const msgs = await canalInv.messages.fetch({ limit: 10 });
      const msgBot = msgs.find(m => m.author.id === client.user.id);
      if (msgBot) {
        await msgBot.edit({ embeds: [inventarioEmbed] });
      } else {
        await canalInv.send({ embeds: [inventarioEmbed] });
      }
    }

    let descricao = `**${atualizados}** item(s) atualizado(s) com sucesso!`;
    if (erros.length) descricao += `\n\n⚠️ Erros:\n${erros.join('\n')}`;

    await interaction.reply({ embeds: [embedSucesso('Inventário ajustado!', descricao)], flags: 64 });

    await interaction.message.edit({
      embeds: [embedGerencia()],
      components: [rowMenuGerencia(), rowMenuGerencia2()]
    });
  }
};