const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

client.commands = new Collection();
client.buttons = new Collection();
client.selects = new Collection();
client.modals = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// Load interactions
const interactionsPath = path.join(__dirname, 'interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(f => f.endsWith('.js'));
for (const file of interactionFiles) {
  const interaction = require(path.join(interactionsPath, file));
  if (interaction.customIds) {
    for (const id of interaction.customIds) {
      if (interaction.type === 'button') client.buttons.set(id, interaction);
      if (interaction.type === 'select') client.selects.set(id, interaction);
      if (interaction.type === 'modal') client.modals.set(id, interaction);
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Stocky online como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
    }
    else if (interaction.isButton()) {
      for (const [id, handler] of client.buttons) {
        if (interaction.customId === id || interaction.customId.startsWith(id + ':')) {
          await handler.execute(interaction, client);
          return;
        }
      }
    }
    else if (interaction.isStringSelectMenu()) {
      for (const [id, handler] of client.selects) {
        if (interaction.customId === id || interaction.customId.startsWith(id + ':')) {
          await handler.execute(interaction, client);
          return;
        }
      }
    }
    else if (interaction.isModalSubmit()) {
      for (const [id, handler] of client.modals) {
        if (interaction.customId === id || interaction.customId.startsWith(id + ':')) {
          await handler.execute(interaction, client);
          return;
        }
      }
    }
  } catch (err) {
    console.error('Erro na interação:', err);
    const msg = { content: '❌ Ocorreu um erro ao processar essa interação.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

client.login(token);