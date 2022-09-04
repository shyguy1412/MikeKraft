import { ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { discord_config } from '../.config.json';

const {token, applicationId} = discord_config;

export const cmdMap = {
    'channel': channelCommand,
    'role': roleCommand,
    'server': serverCommand
}

function channelCommand(interaction: ChatInputCommandInteraction) {

    const channel = interaction.options.getChannel('output');

    interaction.reply({ ephemeral: false, content: channel?.name + " selected" })

}

function roleCommand(interaction: ChatInputCommandInteraction) {

    const role = interaction.options.getRole('target');

    interaction.reply({ ephemeral: false, content: role?.name + " selected" })

}

function serverCommand(interaction: ChatInputCommandInteraction) {
    const server = interaction.options.getString('server')!;

    interaction.reply({ ephemeral: false, content: server + " selected" })
}

export function registerCommands() {
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
    ].map(command => console.log(command));

    const rest = new REST({ version: '10' }).setToken(token);

    rest.put(Routes.applicationCommands(applicationId), { body: commands })
        .then((data: any) => console.log(`Successfully registered ${data.length} application commands.`))
        .catch(console.error);

}