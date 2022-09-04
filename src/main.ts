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

startService();

function checkAllServersService() {

    let timeout: NodeJS.Timeout;

    return {
        startService: () => {
            timeout = setTimeout(() => {
                checkAllServers();
                startService();
            }, 5000);
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
        checkServersForGuild(guildId);
    })
}

let guildAccessLock: string[] = [];
async function checkServersForGuild(guildId: string) {
    if (guildAccessLock.includes(guildId)) {
        return;
    }

    guildAccessLock.push(guildId);

    const servers = await listServersToWatch(guildId);

    for (const [server, old_status] of Object.entries(servers)) {
        const new_status = await checkServer(server);
        if (new_status != old_status) {
            await setServerStatus(server, new_status, guildId);
            sendStatusNotification(server, new_status, guildId);
        }
    }

    guildAccessLock = guildAccessLock.filter((item) => item != guildId);
}

async function sendStatusNotification(server: string, status: boolean, guildId: string) {
    const channelId = getOutputTextChannel(guildId);
    const targetRole = getRoleToPing(guildId);
    const targetGuild = await client.guilds.fetch(guildId);
    const targetChannel = await targetGuild.channels.fetch(await channelId) as TextChannel;
    targetChannel.send(`<@&${await targetRole}> Server ${server} went ${status ? 'online' : 'offline'}`);
}