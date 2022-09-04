import { ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder, TextChannel } from "discord.js";
import { discord_config } from '../.config.json';
import { addServerToWatch, setOutputTextChannel, setRoleToPing } from "./db";

const { token, applicationId } = discord_config;

export const cmdMap = {
    'channel': channelCommand,
    'role': roleCommand,
    'server': serverCommand
}

function channelCommand(interaction: ChatInputCommandInteraction) {

    const channel = interaction.options.getChannel('output') as TextChannel;

    if (!(channel instanceof TextChannel)) {
        interaction.reply({ ephemeral: false, content: "Selected channel must be a text channel" });
        return;
    }

    // interaction.deferReply();
    setOutputTextChannel(channel.id, interaction.guildId!)
        .then(() => interaction.reply({ ephemeral: false, content: `<#${channel.id}> was selected` }))
        .catch((e) => interaction.reply({ ephemeral: false, content: `Something went wrong, please try again later ${e}` }))

}

function roleCommand(interaction: ChatInputCommandInteraction) {

    const role = interaction.options.getRole('target')!;

    // interaction.deferReply();
    setRoleToPing(role.id, interaction.guildId!)
        .then(() => interaction.reply({ ephemeral: false, content: `<@&${role.id}> was selected` }))
        .catch(() => interaction.reply({ ephemeral: false, content: `Something went wrong, please try again later` }))

}

function serverCommand(interaction: ChatInputCommandInteraction) {
    const server = interaction.options.getString('server')!;


    // interaction.deferReply();
    addServerToWatch(server, interaction.guildId!)
        .then(() => interaction.reply({ ephemeral: false, content: `${server} was added` }))
        .catch(() => interaction.reply({ ephemeral: false, content: `Something went wrong, please try again later` }))
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