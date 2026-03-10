const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedGerencia, embedMenuPrincipal } = require('../utils/embeds');
const { getCategorias } = require('../utils/db');

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

function rowCancelar() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ger_cancelar')
      .setLabel('❌ Cancelar')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  type: 'button',
  customIds: ['ger_adicionar_item', 'ger_remover_item', 'ger_zerar_bau', 'ger_ver_logs', 'ger_cancelar'],

  async execute(interaction, client) {
    await interaction.deferUpdate();
    const acao = interaction.customId;

    if (acao === 'ger_cancelar') {
      return interaction.editReply({
        embeds: [embedGerencia()],
        components: [rowMenuGerencia()]
      });
    }

    if (acao === 'ger_adicionar_item') {
      const categorias = await getCategorias();
      const select = new StringSelectMenuBuilder()
        .setCustomId('ger_cat_adicionar')
        .setPlaceholder('Selecione a categoria...')
        .addOptions(categorias.map(cat => ({ label: cat.nome, value: cat.id, emoji: cat.emoji })));

      return interaction.editReply({
        embeds: [embedGerencia().setDescription('> Selecione a categoria do novo item:')],
        components: [new ActionRowBuilder().addComponents(select), rowCancelar()]
      });
    }

    if (acao === 'ger_remover_item') {
      const categorias = await getCategorias();
      const select = new StringSelectMenuBuilder()
        .setCustomId('ger_cat_remover')
        .setPlaceholder('Selecione a categoria...')
        .addOptions(categorias.map(cat => ({ label: cat.nome, value: cat.id, emoji: cat.emoji })));

      return interaction.editReply({
        embeds: [embedGerencia().setDescription('> Selecione a categoria do item que deseja remover:')],
        components: [new ActionRowBuilder().addComponents(select), rowCancelar()]
      });
    }

    if (acao === 'ger_zerar_bau') {
      const select = new StringSelectMenuBuilder()
        .setCustomId('ger_zerar_confirmar')
        .setPlaceholder('Selecione qual baú zerar...')
        .addOptions([
          { label: 'Baú dos Membros', value: 'membros' },
          { label: 'Baú da Gerência', value: 'gerencia' },
          { label: 'Ambos os Baús', value: 'ambos' }
        ]);

      return interaction.editReply({
        embeds: [embedGerencia().setDescription('> ⚠️ Selecione qual baú deseja zerar. Essa ação é irreversível!')],
        components: [new ActionRowBuilder().addComponents(select), rowCancelar()]
      });
    }

    if (acao === 'ger_ver_logs') {
      const select = new StringSelectMenuBuilder()
        .setCustomId('ger_logs_tipo')
        .setPlaceholder('Ver logs de qual baú?')
        .addOptions([
          { label: 'Baú dos Membros', value: 'membros' },
          { label: 'Baú da Gerência', value: 'gerencia' }
        ]);

      return interaction.editReply({
        embeds: [embedGerencia().setDescription('> Selecione de qual baú deseja ver os logs:')],
        components: [new ActionRowBuilder().addComponents(select), rowCancelar()]
      });
    }
  }
};