import { discord_config } from '../.config.json';
import { Client, REST, Routes, TextChannel } from 'discord.js';
import { cmdMap } from './commands';
import { request } from 'https';
import { addGuildToDatabase, getAllGuildsFromDatabase, getOutputTextChannel, getRoleToPing, getServerStatus, listServersToWatch, removeGuildFromDatabase, setServerStatus, validateDatabase } from './db';
import { checkServer } from './minestate';

const { token } = discord_config;

const client = new Client({
    intents: []
});

const rest = new REST({ version: '10' }).setToken(token);

//make sure all guilds are in the database
rest.get(Routes.userGuilds())
    .then((guilds) => {
        (guilds as any[]).forEach(guild =>
            addGuildToDatabase(guild.id)
                .catch(err => {
                    if (err.code != 11000) console.error(err)
                })
        )
    });

//joined a server
client.on("guildCreate", guild => {
    addGuildToDatabase(guild.id)
        .catch(err => console.error(err))
});

//removed from a server
client.on("guildDelete", guild => {
    removeGuildFromDatabase(guild.id)
        .catch(err => console.error(err))
});

//Command was executed
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    //If the command is known, execute it
    if (Object.keys(cmdMap).includes(commandName))
        cmdMap[commandName as keyof typeof cmdMap](interaction);

});

validateDatabase().then(() => client.login(token));

const { startService } = checkAllServersService();

// startService();

function checkAllServersService() {

    let timeout: NodeJS.Timeout;

    return {
        startService: () => {
            timeout = setTimeout(checkAllServers, 10000);
        },
        stopService: () => {
            clearTimeout(timeout);
        }
    }
}

async function checkAllServers() {

    const guilds = await getAllGuildsFromDatabase();

    guilds.forEach(guild => {
        const guildId = guild.guildId;
        listServersToWatch(guildId)
            .then(servers => servers.forEach(async (server:string) => {
                const new_status = checkServer(server);
                const old_status = getServerStatus(server, guildId);
                if (await new_status != await old_status) {
                    setServerStatus(server, await new_status, guildId);
                    sendStatusNotification(server, await new_status, guildId);
                }
            }))
    })
}

async function sendStatusNotification(server: string, status: boolean, guildId: string) {
    const targetChannelId = getOutputTextChannel(guildId);
    const targetRole = getRoleToPing(guildId);
    const targetChannel = <TextChannel>client.guilds.cache.get(guildId)?.channels.cache.get(await targetChannelId);
    targetChannel.send(`<@&${await targetRole}> Server ${server} went ${status ? 'online' : 'offline'}`);
}