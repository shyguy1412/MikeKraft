import { Role, TextChannel } from 'discord.js';
import { MongoClient } from 'mongodb';
import {mongodb_config} from '../.config.json';

const client = new MongoClient(buildMongoURLFromConfig(mongodb_config));

function buildMongoURLFromConfig(config: { port: number|string; host: string; user: string; pass: string; }): string{
    const {user, pass, host, port} = config;
    return `mongodb://${user}:${pass}@${host}:${port}`
}

export function storeWatchedServerAddress(address:string, guildId:string){

}

export function removeWatchedServerAddress(address:string, guildId:string){

}

export function listWatchedServerAdresses(guildId:string){

}

export function setRoleToPing(role:Role, guildId:string){

}

export function setOutputTextChannel(channel:TextChannel, guildId:string){

}