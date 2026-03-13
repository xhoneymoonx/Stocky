# 📦 Stocky — Bot de Gerenciamento de Baú

Bot Discord para gerenciamento de inventário de grupos em servidores FiveM RP.  


---

## Funcionalidades

- **Baú dos Membros e Baú da Gerência** — menus fixos nos canais com adicionar, remover e ver estoque
- **Painel da Gerência** — adicionar/remover itens do catálogo, zerar baú, ver logs e ajustar inventário em massa
- **Caixa da Gangue** — controle de dinheiro sujo e limpo com anotações e histórico
- **Inventário em tempo real** — atualiza automaticamente nos canais após cada movimentação
- **Logs automáticos** — registra todas as entradas e saídas com responsável, item e quantidade
- **Ajuste em massa** — gerência pode editar o inventário inteiro de uma vez via modal
- **Banco de dados Firebase** — dados persistentes, nunca perdidos entre deploys

---

## Stack

- [Node.js](https://nodejs.org/)
- [discord.js v14](https://discord.js.org/)
- [Firebase Firestore](https://firebase.google.com/)
- Hospedado no [Railway](https://railway.app/)

---

## Configuração

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Copie `config.example.json` para `config.json` e preencha com seus dados
4. Registre os comandos: `node deploy-commands.js`
5. Inicie o bot: `node start.js`

---

## Aviso

> Este projeto foi desenvolvido com auxílio do **Claude AI (Anthropic)** como ferramenta de aprendizado e desenvolvimento assistido por IA.

---

## Licença

MIT
