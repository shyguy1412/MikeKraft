import { discord_config } from '../.config.json';
import { Client } from 'discord.js';
import { cmdMap } from './commands';

const { token } = discord_config;

const client = new Client({
    intents: []
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (Object.keys(cmdMap).includes(commandName))
        cmdMap[commandName as keyof typeof cmdMap](interaction);

});

client.login(token);
