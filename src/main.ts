import { APIInteraction, APIInteractionDataResolvedChannel, APIRole, ChatInputCommandInteraction, Client, GuildBasedChannel, Role, TextChannel } from 'discord.js';
import { token, applicationId } from '../.config.json';
import { SlashCommandBuilder, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import { resolve } from 'path';
import https from 'https';

const client = new Client({
    intents: []
});

const cmdMap = {
    'channel': channelCommand,
    'role': roleCommand,
    'server': serverCommand
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (Object.keys(cmdMap).includes(commandName))
        //@ts-ignore
        cmdMap[commandName](interaction);
});


const commands = [
    new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Sets the output channel')
        .addChannelOption(option =>
            option.setName('output')
                .setDescription('Channel the put outputs to')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('role')
        .setDescription('Sets the role that gets pinged')
        .addRoleOption(option =>
            option.setName('target')
                .setDescription('Role the bot pings')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('server')
        .setDescription('Sets the server that gets watched')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Server ip')
                .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(applicationId), { body: commands })
    .then((data: any) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);

client.login(token);

let channel: APIInteractionDataResolvedChannel | GuildBasedChannel | null,
    role: Role | APIRole | null,
    server: string,
    old_state = false;

function channelCommand(interaction: ChatInputCommandInteraction) {

    channel = interaction.options.getChannel('output');

    interaction.reply({ ephemeral: false, content: channel?.name + " selected" })

}

function roleCommand(interaction: ChatInputCommandInteraction) {

    role = interaction.options.getRole('target');

    interaction.reply({ ephemeral: false, content: role?.name + " selected" })

}

function serverCommand(interaction: ChatInputCommandInteraction) {
    server = interaction.options.getString('server')!;

    interaction.reply({ ephemeral: false, content: server + " selected" })


    const scan = () => setTimeout(() => {
        checkServer(server as string)
            .then((result) => {
                if (result != old_state) {
                    old_state = result;
                    (<TextChannel>client.channels.cache.get(channel!.id)).send(`<@&${role?.id}> Server went ${result?'online':'offline'}`);
                }
            })
            scan();
    }, 10000);
    
    scan();

}

// process.exit();

function checkServer(url: string) {
    return new Promise<boolean>(resolve => {
        https.request({
            host: 'api.mcsrvstat.us',
            path: `/2/${url}`,
            method: 'GET',
            // headers: {
            //     'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:'104.0) Gecko / 20100101 Firefox / 104.0",
            // }
        }, response => {
            let body = '';
            response.on('data', (chunk: Buffer) => body += chunk);
            response.on('end', () => {

                const data = JSON.parse(body);

                resolve(data.online);
            })
        }).end()
    })
}