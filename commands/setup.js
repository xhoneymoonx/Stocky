const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedMenuPrincipal, embedGerencia } = require('../utils/embeds');
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

function rowMenuGerencia2() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ger_ajustar_membros')
      .setLabel('📝 Ajustar Baú Membros')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ger_ajustar_gerencia')
      .setLabel('📝 Ajustar Baú Gerência')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Envia a mensagem fixa no canal (use apenas uma vez)')
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Qual painel configurar?')
        .setRequired(true)
        .addChoices(
          { name: '📦 Baú dos Membros', value: 'membros' },
          { name: '🔐 Baú da Gerência', value: 'gerencia' },
          { name: '⚙️ Painel da Gerência', value: 'painel' }
        )
    ),

  async execute(interaction, client) {
    const tipo = interaction.options.getString('tipo');

    if (tipo === 'painel') {
      const canal = client.channels.cache.get(config.channels.painelGerencia);
      if (!canal) return interaction.reply({ content: '❌ Canal do painel não encontrado.', flags: 64 });

      await canal.send({ embeds: [embedGerencia()], components: [rowMenuGerencia(), rowMenuGerencia2()] });
      return interaction.reply({ content: '✅ Painel da gerência enviado!', flags: 64 });
    }

    const canalId = tipo === 'gerencia' ? config.channels.bauGerencia : config.channels.bauMembros;
    const canal = client.channels.cache.get(canalId);
    if (!canal) return interaction.reply({ content: '❌ Canal não encontrado.', flags: 64 });

    const row = new ActionRowBuilder().addComponents(
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

    await canal.send({ embeds: [embedMenuPrincipal(tipo)], components: [row] });
    return interaction.reply({ content: '✅ Mensagem fixa enviada!', flags: 64 });
  }
};