const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedSelecionarItem, embedMenuPrincipal } = require('../utils/embeds');
const { getCategorias, getItensDaCategoria } = require('../utils/db');

function rowMenuBau(tipo) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`bau_adicionar:${tipo}`)
      .setLabel('📥 Adicionar')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`bau_remover:${tipo}`)
      .setLabel('📤 Remover')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`bau_estoque:${tipo}`)
      .setLabel('📋 Ver Estoque')
      .setStyle(ButtonStyle.Primary)
  );
}

function rowCancelar(tipo) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`bau_cancelar:${tipo}`)
      .setLabel('❌ Cancelar')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  type: 'select',
  customIds: ['bau_categoria'],

  async execute(interaction, client) {
    await interaction.deferUpdate();
    const [, acao, tipo] = interaction.customId.split(':');
    const categoriaId = interaction.values[0];

    const categorias = getCategorias();
    const categoria = categorias.find(c => c.id === categoriaId);
    const itens = getItensDaCategoria(categoriaId);

    if (!itens.length) {
      return interaction.editReply({
        embeds: [embedMenuPrincipal(tipo)],
        components: [rowMenuBau(tipo)]
      });
    }

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`bau_item:${acao}:${tipo}:${categoriaId}`)
        .setPlaceholder('Selecione um item...')
        .addOptions(itens.map(item => ({ label: item.nome, value: item.id })))
    );

    return interaction.editReply({
      embeds: [embedSelecionarItem(acao, categoria.nome, categoria.emoji)],
      components: [selectRow, rowCancelar(tipo)]
    });
  }
};