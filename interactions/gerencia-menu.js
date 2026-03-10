const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { embedGerencia } = require('../utils/embeds');
const { getCategorias, getBau } = require('../utils/db');

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

function rowCancelar() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ger_cancelar').setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  type: 'button',
  customIds: ['ger_adicionar_item', 'ger_remover_item', 'ger_zerar_bau', 'ger_ver_logs', 'ger_cancelar', 'ger_ajustar_membros', 'ger_ajustar_gerencia'],

  async execute(interaction, client) {
    const acao = interaction.customId;

    if (acao === 'ger_ajustar_membros' || acao === 'ger_ajustar_gerencia') {
      const tipo = acao === 'ger_ajustar_membros' ? 'membros' : 'gerencia';
      const bau = await getBau(tipo);
      const categorias = await getCategorias();

      let texto = '';
      for (const cat of categorias) {
        const itensNoBau = Object.entries(bau).filter(([key]) => key.startsWith(cat.id + '__'));
        if (itensNoBau.length === 0) continue;
        texto += `# ${cat.nome}\n`;
        for (const [, item] of itensNoBau) {
          texto += `${item.nome}:${item.quantidade}\n`;
        }
        texto += '\n';
      }

      if (!texto) texto = 'Bau vazio.';

      try {
        await interaction.user.send({
          content: `📋 **Inventário atual — Baú dos ${tipo === 'membros' ? 'Membros' : 'Gerência'}**\n\nCopie, edite os números e cole no modal:\n\`\`\`\n${texto}\`\`\``
        });
      } catch (e) {}

      const modal = new ModalBuilder()
        .setCustomId(`ger_modal_ajustar:${tipo}`)
        .setTitle(`Ajustar Inventário — ${tipo === 'membros' ? 'Membros' : 'Gerência'}`);

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('inventario')
            .setLabel('Cole o inventário editado aqui')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Gaze:120\nBandagem:97\n...')
            .setRequired(true)
            .setMaxLength(4000)
        )
      );

      return interaction.showModal(modal);
    }

    await interaction.deferUpdate();

    if (acao === 'ger_cancelar') {
      return interaction.editReply({
        embeds: [embedGerencia()],
        components: [rowMenuGerencia(), rowMenuGerencia2()]
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