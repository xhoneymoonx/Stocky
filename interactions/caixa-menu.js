const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { getSaldo, adicionarCaixa, retirarCaixa, addLogCaixa, getLogsCaixa } = require('../utils/caixa');
const { podeUsarBauGerencia } = require('../utils/permissoes');
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

function embedLog(acao, usuario, tipo, valor, anotacao, saldo) {
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
  type: 'button',
  customIds: ['caixa_adicionar', 'caixa_retirar', 'caixa_logs'],

  async execute(interaction, client) {
    if (!podeUsarBauGerencia(interaction.member)) {
      return interaction.reply({
        content: '❌ Apenas **Consejeros** e **El Diablo** podem usar o caixa.',
        flags: 64
      });
    }

    const acao = interaction.customId;

    if (acao === 'caixa_logs') {
      await interaction.deferUpdate();
      const logs = getLogsCaixa();

      if (!logs.length) {
        return interaction.editReply({
          embeds: [embedCaixa(getSaldo()).setDescription('> 📭 Nenhuma movimentação registrada ainda.')],
          components: [rowCaixa()]
        });
      }

      const ultimos = logs.slice(0, 10);
      const linhas = ultimos.map(l => {
        const data = new Date(l.timestamp).toLocaleString('pt-BR');
        const icone = l.acao === 'adicionar' ? '➕' : '➖';
        const tipoNome = l.tipo === 'sujo' ? '🖤 Sujo' : '💵 Limpo';
        return `${icone} **$${l.valor.toLocaleString('pt-BR')}** ${tipoNome} — ${l.anotacao} — <@${l.usuarioId}> — ${data}`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('📋 Histórico do Caixa')
        .setDescription(linhas)
        .setFooter({ text: 'Marabunta Grande — Stocky' })
        .setTimestamp();

      return interaction.editReply({
        embeds: [embed],
        components: [rowCaixa()]
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`caixa_modal:${acao === 'caixa_adicionar' ? 'adicionar' : 'retirar'}`)
      .setTitle(acao === 'caixa_adicionar' ? '➕ Adicionar ao Caixa' : '➖ Retirar do Caixa');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('tipo')
          .setLabel('Tipo (sujo ou limpo)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('sujo ou limpo')
          .setRequired(true)
          .setMaxLength(5)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('valor')
          .setLabel('Valor')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: 50000')
          .setRequired(true)
          .setMaxLength(15)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('anotacao')
          .setLabel('Anotação')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: Comprar LSD')
          .setRequired(true)
          .setMaxLength(100)
      )
    );

    return interaction.showModal(modal);
  }
};