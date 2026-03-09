const { embedSucesso, embedErro, embedLog } = require('../utils/embeds');
const { adicionarAoBau, removerDoBau, getItensDaCategoria, getCategorias, addLog, getBau } = require('../utils/db');
const { embedInventario } = require('../utils/embeds');
const config = require('../config.json');

module.exports = {
  type: 'modal',
  customIds: ['bau_quantidade'],

  async execute(interaction, client) {
    const [, acao, tipo, categoriaId, itemId] = interaction.customId.split(':');
    const quantidadeRaw = interaction.fields.getTextInputValue('quantidade');
    const quantidade = parseInt(quantidadeRaw);

    if (isNaN(quantidade) || quantidade <= 0) {
      return interaction.reply({
        embeds: [embedErro('Quantidade inválida', 'Digite um número inteiro maior que zero.')],
        flags: 64
      });
    }

    const itens = getItensDaCategoria(tipo, categoriaId);
    const item = itens.find(i => i.id === itemId);
    const categorias = getCategorias(tipo);
    const categoria = categorias.find(c => c.id === categoriaId);

    if (!item || !categoria) {
      return interaction.reply({
        embeds: [embedErro('Erro', 'Item ou categoria não encontrado.')],
        flags: 64
      });
    }

    let novaQtd;

    if (acao === 'adicionar') {
      novaQtd = adicionarAoBau(tipo, categoriaId, itemId, quantidade, item.nome, categoria.nome, item.emoji);
      await interaction.reply({
        embeds: [embedSucesso(
          'Item adicionado!',
          `${item.emoji} **${item.nome}** — adicionado **${quantidade}** unidade(s).\nSaldo atual: **${novaQtd}**`
        )],
        flags: 64
      });
    } else {
      const resultado = removerDoBau(tipo, categoriaId, itemId, quantidade);
      if (!resultado.sucesso) {
        return interaction.reply({
          embeds: [embedErro('Estoque insuficiente', resultado.motivo)],
          flags: 64
        });
      }
      novaQtd = resultado.novaQtd;
      await interaction.reply({
        embeds: [embedSucesso(
          'Item removido!',
          `${item.emoji} **${item.nome}** — removido **${quantidade}** unidade(s).\nSaldo atual: **${novaQtd}**`
        )],
        flags: 64
      });
    }

    // ─── LOG ──────────────────────────────────────────────────────────────────
    addLog(tipo, {
      acao,
      usuarioId: interaction.user.id,
      usuarioTag: interaction.user.tag,
      item: { id: itemId, nome: item.nome, emoji: item.emoji },
      categoria: categoria.nome,
      quantidade,
      novaQtd
    });

    const canalLogId = tipo === 'gerencia' ? config.channels.logGerencia : config.channels.logMembros;
    const canalLog = client.channels.cache.get(canalLogId);
    if (canalLog) {
      await canalLog.send({
        embeds: [embedLog(acao, interaction.user, item, categoria.nome, quantidade, novaQtd, tipo)]
      });
    }

    // ─── ATUALIZAR INVENTÁRIO ─────────────────────────────────────────────────
    const canalInvId = tipo === 'gerencia' ? config.channels.inventarioGerencia : config.channels.inventarioMembros;
    const canalInv = client.channels.cache.get(canalInvId);
    if (canalInv) {
      const bau = getBau(tipo);
      const msgs = await canalInv.messages.fetch({ limit: 10 });
      const msgBot = msgs.find(m => m.author.id === client.user.id);
      if (msgBot) {
        await msgBot.edit({ embeds: [embedInventario(bau, tipo)] });
      } else {
        await canalInv.send({ embeds: [embedInventario(bau, tipo)] });
      }
    }
  }
};