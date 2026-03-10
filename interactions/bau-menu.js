const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedSelecionarCategoria, embedInventario, embedMenuPrincipal } = require('../utils/embeds');
const { getCategorias, getBau } = require('../utils/db');

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
  type: 'button',
  customIds: ['bau_adicionar', 'bau_remover', 'bau_estoque', 'bau_cancelar'],

  async execute(interaction, client) {
    await interaction.deferUpdate();
    const [acao, tipo] = interaction.customId.split(':');

    if (acao === 'bau_cancelar') {
      return interaction.editReply({
        embeds: [embedMenuPrincipal(tipo)],
        components: [rowMenuBau(tipo)]
      });
    }

    if (acao === 'bau_estoque') {
      const bau = await getBau(tipo);
      return interaction.editReply({
        embeds: [embedInventario(bau, tipo)],
        components: [rowMenuBau(tipo)]
      });
    }

    const acaoNome = acao === 'bau_adicionar' ? 'adicionar' : 'remover';
    const categorias = await getCategorias();

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`bau_categoria:${acaoNome}:${tipo}`)
        .setPlaceholder('Selecione uma categoria...')
        .addOptions(categorias.map(cat => ({ label: cat.nome, value: cat.id, emoji: cat.emoji })))
    );

    return interaction.editReply({
      embeds: [embedSelecionarCategoria(tipo, acaoNome)],
      components: [selectRow, rowCancelar(tipo)]
    });
  }
};