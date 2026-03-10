const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { getItensDaCategoria } = require('../utils/db');

module.exports = {
  type: 'select',
  customIds: ['bau_item'],

  async execute(interaction, client) {
    const [, acao, tipo, categoriaId] = interaction.customId.split(':');
    const itemId = interaction.values[0];
    const itens = await getItensDaCategoria(categoriaId);
    const item = itens.find(i => i.id === itemId);

    const modal = new ModalBuilder()
      .setCustomId(`bau_quantidade:${acao}:${tipo}:${categoriaId}:${itemId}`)
      .setTitle(`${acao === 'adicionar' ? 'Adicionar' : 'Remover'} — ${item.nome}`);

    const input = new TextInputBuilder()
      .setCustomId('quantidade')
      .setLabel(`Quantidade para ${acao === 'adicionar' ? 'adicionar' : 'remover'}`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: 10')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(10);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }
};