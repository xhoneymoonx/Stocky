const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { getSaldo } = require('../utils/caixa');

function embedCaixa(saldo) {
  return new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle('💰 Caixa da Gangue')
    .setDescription('> Área restrita para **Consejeros** e **El Diablo**.')
    .addFields(
      { name: '🖤 Dinheiro Sujo', value: `$${saldo.sujo.toLocaleString('pt-BR')}`, inline: true },
      { name: '💵 Dinheiro Limpo', value: `$${saldo.limpo.toLocaleString('pt-BR')}`, inline: true }
    )
    .setFooter({ text: 'Marabunta Grande — Stocky' })
    .setTimestamp();
}

function rowCaixa() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('caixa_adicionar')
      .setLabel('➕ Adicionar')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('caixa_retirar')
      .setLabel('➖ Retirar')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('caixa_logs')
      .setLabel('📋 Ver Histórico')
      .setStyle(ButtonStyle.Primary)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-caixa')
    .setDescription('Envia a mensagem fixa do caixa no canal (use apenas uma vez)'),

  async execute(interaction, client) {
    const canal = client.channels.cache.get(config.channels.caixaGangue);
    if (!canal) {
      return interaction.reply({ content: '❌ Canal do caixa não encontrado.', flags: 64 });
    }

    const saldo = getSaldo();
    await canal.send({ embeds: [embedCaixa(saldo)], components: [rowCaixa()] });
    return interaction.reply({ content: '✅ Caixa enviado!', flags: 64 });
  }
};