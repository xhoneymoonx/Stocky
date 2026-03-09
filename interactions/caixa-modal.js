const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getSaldo, adicionarCaixa, retirarCaixa, addLogCaixa } = require('../utils/caixa');
const config = require('../config.json');

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

function embedLogCaixa(acao, usuario, tipo, valor, anotacao, saldo) {
  const isAdd = acao === 'adicionar';
  const tipoNome = tipo === 'sujo' ? '🖤 Dinheiro Sujo' : '💵 Dinheiro Limpo';
  return new EmbedBuilder()
    .setColor(isAdd ? 0x2ECC71 : 0xE74C3C)
    .setTitle(isAdd ? '➕ Entrada no Caixa' : '➖ Saída do Caixa')
    .addFields(
      { name: '👤 Responsável', value: `<@${usuario.id}> — ${usuario.tag}`, inline: true },
      { name: '💰 Tipo', value: tipoNome, inline: true },
      { name: isAdd ? '➕ Valor Adicionado' : '➖ Valor Retirado', value: `$${valor.toLocaleString('pt-BR')}`, inline: true },
      { name: '📝 Anotação', value: anotacao, inline: false },
      { name: '🖤 Saldo Sujo', value: `$${saldo.sujo.toLocaleString('pt-BR')}`, inline: true },
      { name: '💵 Saldo Limpo', value: `$${saldo.limpo.toLocaleString('pt-BR')}`, inline: true }
    )
    .setFooter({ text: 'Marabunta Grande — Stocky' })
    .setTimestamp();
}

module.exports = {
  type: 'modal',
  customIds: ['caixa_modal'],

  async execute(interaction, client) {
    const [, acao] = interaction.customId.split(':');
    const tipoRaw = interaction.fields.getTextInputValue('tipo').toLowerCase().trim();
    const valorRaw = interaction.fields.getTextInputValue('valor').replace(/\D/g, '');
    const anotacao = interaction.fields.getTextInputValue('anotacao');

    if (tipoRaw !== 'sujo' && tipoRaw !== 'limpo') {
      await interaction.reply({
        content: '❌ Tipo inválido! Digite **sujo** ou **limpo**.',
        flags: 64
      });
      await interaction.message.edit({
        embeds: [embedCaixa(getSaldo())],
        components: [rowCaixa()]
      });
      return;
    }

    const valor = parseInt(valorRaw);
    if (isNaN(valor) || valor <= 0) {
      await interaction.reply({
        content: '❌ Valor inválido! Digite um número maior que zero.',
        flags: 64
      });
      await interaction.message.edit({
        embeds: [embedCaixa(getSaldo())],
        components: [rowCaixa()]
      });
      return;
    }

    let saldo;

    if (acao === 'adicionar') {
      saldo = adicionarCaixa(tipoRaw, valor);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Adicionado ao Caixa!')
            .setDescription(`**$${valor.toLocaleString('pt-BR')}** de ${tipoRaw === 'sujo' ? '🖤 Dinheiro Sujo' : '💵 Dinheiro Limpo'} adicionado.\n📝 ${anotacao}`)
            .setFooter({ text: 'Marabunta Grande — Stocky' })
            .setTimestamp()
        ],
        flags: 64
      });
    } else {
      const resultado = retirarCaixa(tipoRaw, valor);
      if (!resultado.sucesso) {
        await interaction.reply({
          content: `❌ ${resultado.motivo}`,
          flags: 64
        });
        await interaction.message.edit({
          embeds: [embedCaixa(getSaldo())],
          components: [rowCaixa()]
        });
        return;
      }
      saldo = resultado.saldo;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('✅ Retirado do Caixa!')
            .setDescription(`**$${valor.toLocaleString('pt-BR')}** de ${tipoRaw === 'sujo' ? '🖤 Dinheiro Sujo' : '💵 Dinheiro Limpo'} retirado.\n📝 ${anotacao}`)
            .setFooter({ text: 'Marabunta Grande — Stocky' })
            .setTimestamp()
        ],
        flags: 64
      });
    }

    await interaction.message.edit({
      embeds: [embedCaixa(saldo)],
      components: [rowCaixa()]
    });

    addLogCaixa({
      acao,
      usuarioId: interaction.user.id,
      usuarioTag: interaction.user.tag,
      tipo: tipoRaw,
      valor,
      anotacao
    });

    const canalLog = client.channels.cache.get(config.channels.logCaixa);
    if (canalLog) {
      await canalLog.send({ embeds: [embedLogCaixa(acao, interaction.user, tipoRaw, valor, anotacao, saldo)] });
    }

    const canalSaldo = client.channels.cache.get(config.channels.saldoCaixa);
    if (canalSaldo) {
      const msgs = await canalSaldo.messages.fetch({ limit: 10 });
      const msgBot = msgs.find(m => m.author.id === client.user.id);
      if (msgBot) {
        await msgBot.edit({ embeds: [embedCaixa(saldo)] });
      } else {
        await canalSaldo.send({ embeds: [embedCaixa(saldo)] });
      }
    }
  }
};