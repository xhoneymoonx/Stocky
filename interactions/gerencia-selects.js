const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedGerencia, embedSucesso, embedErro, embedInventario } = require('../utils/embeds');
const { getCategorias, getItensDaCategoria, zerarBau, getLogs, removerItemDoCatalogo, getBau } = require('../utils/db');
const config = require('../config.json');

function rowMenuGerencia() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ger_adicionar_item')
      .setLabel('➕ Adicionar Item')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ger_remover_item')
      .setLabel('➖ Remover Item')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ger_zerar_bau')
      .setLabel('🗑️ Zerar Baú')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ger_ver_logs')
      .setLabel('📋 Ver Logs')
      .setStyle(ButtonStyle.Primary)
  );
}

async function atualizarInventario(client, tipo) {
  const canalInvId = tipo === 'gerencia' ? config.channels.inventarioGerencia : config.channels.inventarioMembros;
  const canalInv = client.channels.cache.get(canalInvId);
  if (!canalInv) return;
  const bau = await getBau(tipo);
  const msgs = await canalInv.messages.fetch({ limit: 10 });
  const msgBot = msgs.find(m => m.author.id === client.user.id);
  if (msgBot) {
    await msgBot.edit({ embeds: [embedInventario(bau, tipo)] });
  } else {
    await canalInv.send({ embeds: [embedInventario(bau, tipo)] });
  }
}

module.exports = {
  type: 'select',
  customIds: ['ger_cat_adicionar', 'ger_cat_remover', 'ger_zerar_confirmar', 'ger_logs_tipo', 'ger_item_remover'],

  async execute(interaction, client) {
    const acao = interaction.customId;

    if (acao === 'ger_cat_adicionar') {
      const categoriaId = interaction.values[0];
      const modal = new ModalBuilder()
        .setCustomId(`ger_modal_adicionar:${categoriaId}`)
        .setTitle('Adicionar Item ao Catalogo');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('nome')
            .setLabel('Nome do item')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Granada')
            .setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    if (acao === 'ger_cat_remover') {
      await interaction.deferUpdate();
      const categoriaId = interaction.values[0];
      const itens = await getItensDaCategoria(categoriaId);

      if (!itens.length) {
        return interaction.editReply({
          embeds: [embedErro('Sem itens', 'Essa categoria nao possui itens cadastrados.')],
          components: [rowMenuGerencia()]
        });
      }

      const select = new StringSelectMenuBuilder()
        .setCustomId(`ger_item_remover:${categoriaId}`)
        .setPlaceholder('Selecione o item para remover...')
        .addOptions(itens.map(item => ({ label: item.nome, value: item.id })));

      return interaction.editReply({
        embeds: [embedGerencia().setDescription('> Selecione o item que deseja remover do catalogo:')],
        components: [new ActionRowBuilder().addComponents(select)]
      });
    }

    if (acao.startsWith('ger_item_remover')) {
      await interaction.deferUpdate();
      const [, categoriaId] = acao.split(':');
      const itemId = interaction.values[0];

      const resultado = await removerItemDoCatalogo(categoriaId, itemId);
      if (!resultado.sucesso) {
        return interaction.editReply({
          embeds: [embedErro('Erro', resultado.motivo)],
          components: [rowMenuGerencia()]
        });
      }

      const bauMembros = await getBau('membros');
      const bauGerencia = await getBau('gerencia');
      const key = `${categoriaId}__${itemId}`;
      const db = require('./firebase') ;

      if (bauMembros[key]) {
        delete bauMembros[key];
        const { getDb } = require('../utils/firebase');
        await getDb().collection('bau').doc('membros').set(bauMembros);
      }
      if (bauGerencia[key]) {
        delete bauGerencia[key];
        const { getDb } = require('../utils/firebase');
        await getDb().collection('bau').doc('gerencia').set(bauGerencia);
      }

      await atualizarInventario(client, 'membros');
      await atualizarInventario(client, 'gerencia');

      return interaction.editReply({
        embeds: [embedSucesso('Item removido!', 'Item removido do catalogo e dos baus com sucesso.')],
        components: [rowMenuGerencia()]
      });
    }

    if (acao === 'ger_zerar_confirmar') {
      await interaction.deferUpdate();
      const tipo = interaction.values[0];

      if (tipo === 'ambos') {
        await zerarBau('membros');
        await zerarBau('gerencia');
        await atualizarInventario(client, 'membros');
        await atualizarInventario(client, 'gerencia');
      } else {
        await zerarBau(tipo);
        await atualizarInventario(client, tipo);
      }

      return interaction.editReply({
        embeds: [embedSucesso('Bau zerado!', 'O bau foi resetado e o inventario atualizado.')],
        components: [rowMenuGerencia()]
      });
    }

    if (acao === 'ger_logs_tipo') {
      await interaction.deferUpdate();
      const tipo = interaction.values[0];
      const logs = await getLogs(tipo);

      if (!logs.length) {
        return interaction.editReply({
          embeds: [embedErro('Sem logs', 'Nenhuma movimentacao registrada ainda.')],
          components: [rowMenuGerencia()]
        });
      }

      const linhas = logs.map(l => {
        const data = new Date(l.timestamp).toLocaleString('pt-BR');
        const icone = l.acao === 'adicionar' ? '📥' : '📤';
        return `${icone} **${l.item.nome}** x${l.quantidade} — <@${l.usuarioId}> — ${data}`;
      }).join('\n');

      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`📋 Ultimas movimentacoes — ${tipo === 'gerencia' ? 'Bau da Gerencia' : 'Bau dos Membros'}`)
        .setDescription(linhas)
        .setFooter({ text: 'Marabunta Grande — Stocky' })
        .setTimestamp();

      return interaction.editReply({
        embeds: [embed],
        components: [rowMenuGerencia()]
      });
    }
  }
};