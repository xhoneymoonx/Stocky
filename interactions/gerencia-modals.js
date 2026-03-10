const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedSucesso, embedErro, embedGerencia } = require('../utils/embeds');
const { adicionarItemAoCatalogo } = require('../utils/db');

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

module.exports = {
  type: 'modal',
  customIds: ['ger_modal_adicionar'],

  async execute(interaction, client) {
    const [, categoriaId] = interaction.customId.split(':');
    const nome = interaction.fields.getTextInputValue('nome');
    const id = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const resultado = await adicionarItemAoCatalogo(categoriaId, id, nome);

    if (!resultado.sucesso) {
      await interaction.reply({ embeds: [embedErro('Erro', resultado.motivo)], flags: 64 });
    } else {
      await interaction.reply({ embeds: [embedSucesso('Item adicionado!', `**${nome}** foi adicionado ao catalogo com sucesso!`)], flags: 64 });
    }

    await interaction.message.edit({
      embeds: [embedGerencia()],
      components: [rowMenuGerencia()]
    });
  }
};