const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedSucesso, embedErro, embedLog, embedInventario, embedMenuPrincipal } = require('../utils/embeds');
const { adicionarAoBau, removerDoBau, getItensDaCategoria, getCategorias, addLog, getBau } = require('../utils/db');
const config = require('../config.json');

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

module.exports = {
  type: 'modal',
  customIds: ['bau_quantidade'],

  async execute(interaction, client) {
    const [, acao, tipo, categoriaId, itemId] = interaction.customId.split(':');
    const quantidadeRaw = interaction.fields.getTextInputValue('quantidade');
    const quantidade = parseInt(quantidadeRaw);

    if (isNaN(quantidade) || quantidade <= 0) {
      await interaction.reply({ embeds: [embedErro('Quantidade inválida', 'Digite um número inteiro maior que zero.')], flags: 64 });
      await interaction.message.edit({ embeds: [embedMenuPrincipal(tipo)], components: [rowMenuBau(tipo)] });
      return;
    }

    const itens = await getItensDaCategoria(categoriaId);
    const item = itens.find(i => i.id === itemId);
    const categorias = await getCategorias();
    const categoria = categorias.find(c => c.id === categoriaId);

    if (!item || !categoria) {
      await interaction.reply({ embeds: [embedErro('Erro', 'Item ou categoria não encontrado.')], flags: 64 });
      await interaction.message.edit({ embeds: [embedMenuPrincipal(tipo)], components: [rowMenuBau(tipo)] });
      return;
    }

    let novaQtd;

    if (acao === 'adicionar') {
      novaQtd = await adicionarAoBau(tipo, categoriaId, itemId, quantidade, item.nome, categoria.nome);
      await interaction.reply({
        embeds: [embedSucesso('Item adicionado!', `**${item.nome}** — adicionado **${quantidade}** unidade(s).\nSaldo atual: **${novaQtd}**`)],
        flags: 64
      });
    } else {
      const resultado = await removerDoBau(tipo, categoriaId, itemId, quantidade);
      if (!resultado.sucesso) {
        await interaction.reply({ embeds: [embedErro('Estoque insuficiente', resultado.motivo)], flags: 64 });
        await interaction.message.edit({ embeds: [embedMenuPrincipal(tipo)], components: [rowMenuBau(tipo)] });
        return;
      }
      novaQtd = resultado.novaQtd;
      await interaction.reply({
        embeds: [embedSucesso('Item removido!', `**${item.nome}** — removido **${quantidade}** unidade(s).\nSaldo atual: **${novaQtd}**`)],
        flags: 64
      });
    }

    await interaction.message.edit({ embeds: [embedMenuPrincipal(tipo)], components: [rowMenuBau(tipo)] });

    await addLog(tipo, {
      acao,
      usuarioId: interaction.user.id,
      usuarioTag: interaction.user.tag,
      item: { id: itemId, nome: item.nome },
      categoria: categoria.nome,
      quantidade,
      novaQtd
    });

    const canalLogId = tipo === 'gerencia' ? config.channels.logGerencia : config.channels.logMembros;
    const canalLog = client.channels.cache.get(canalLogId);
    if (canalLog) {
      await canalLog.send({ embeds: [embedLog(acao, interaction.user, item, categoria.nome, quantidade, novaQtd, tipo)] });
    }

    const canalInvId = tipo === 'gerencia' ? config.channels.inventarioGerencia : config.channels.inventarioMembros;
    const canalInv = client.channels.cache.get(canalInvId);
    if (canalInv) {
      const bau = await getBau(tipo);
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