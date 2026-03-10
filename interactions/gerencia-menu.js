const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedGerencia } = require('../utils/embeds');
const { getCategorias } = require('../utils/db');

module.exports = {
  type: 'button',
  customIds: ['ger_adicionar_item', 'ger_remover_item', 'ger_zerar_bau', 'ger_ver_logs'],

  async execute(interaction, client) {
    await interaction.deferUpdate();
    const acao = interaction.customId;

    if (acao === 'ger_adicionar_item') {
      const categorias = await getCategorias();
      const select = new StringSelectMenuBuilder()
        .setCustomId('ger_cat_adicionar')
        .setPlaceholder('Selecione a categoria...')
        .addOptions(categorias.map(cat => ({ label: cat.nome, value: cat.id, emoji: cat.emoji })));

      return interaction.editReply({
        embeds: [embedGerencia().setDescription('> Selecione a categoria do novo item:')],
        components: [new ActionRowBuilder().addComponents(select)]
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
        components: [new ActionRowBuilder().addComponents(select)]
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
        components: [new ActionRowBuilder().addComponents(select)]
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
        components: [new ActionRowBuilder().addComponents(select)]
      });
    }
  }
};