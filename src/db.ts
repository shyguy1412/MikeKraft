import { APIRole, Role, TextChannel } from 'discord.js';
import { MongoClient, WithId } from 'mongodb';
import { mongodb_config } from '../.config.json';

const client = new MongoClient(buildMongoURLFromConfig(mongodb_config));

function buildMongoURLFromConfig(config: { port: number | string; host: string; user: string; pass: string; }): string {
    const { user, pass, host, port } = config;
    return `mongodb://${user}:${pass}\@${host}:${port}`
}

const DATABASE = 'mikekraft';
const GUILDS_COLLECTION = 'guilds';

export async function validateDatabase() {
    //Ensure username unique index
    try {
        await client.connect()

        await client
            .db(DATABASE)
            .collection(GUILDS_COLLECTION)
            .createIndex({
                guildId: 1
            }, {
                unique: true
            })
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function addGuildToDatabase(guildId: string) {
    try {
        await client.connect();

        await client.db(DATABASE).collection(GUILDS_COLLECTION).insertOne({
            guildId,
            servers: {},
            role: 'everyone',
            channel: ''
        })
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function removeGuildFromDatabase(guildId: string) {
    try {
        await client.connect();

        await client.db(DATABASE).collection(GUILDS_COLLECTION).deleteOne({
            guildId
        })
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function getAllGuildsFromDatabase() {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).find();

        return await cursor.toArray();
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function addServerToWatch(address: string, guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        })

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        cursor.servers[address] = false;

        await client.db(DATABASE).collection(GUILDS_COLLECTION).updateOne(
            {
                guildId
            }, {
            $set: {
                servers: cursor.servers
            }
        });

    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function removeServerToWatch(address: string, guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        })

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        delete cursor.servers[address];

        await client.db(DATABASE).collection(GUILDS_COLLECTION).updateOne(
            {
                guildId
            }, {
            $set: {
                servers: cursor.servers
            }
        });

    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function listServersToWatch(guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        })

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        return cursor.servers;

    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function setServerStatus(address: string, status: boolean, guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        })

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        cursor.servers[address] = status;

        await client.db(DATABASE).collection(GUILDS_COLLECTION).updateOne(
            {
                guildId
            }, {
            $set: {
                servers: cursor.servers
            }
        });

    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function getServerStatus(address: string, guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        })

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        return cursor.servers[address];
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function setRoleToPing(role: string, guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        });

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        await client.db(DATABASE).collection(GUILDS_COLLECTION).updateOne(
            {
                guildId
            }, {
            $set: {
                role
            }
        });
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function getRoleToPing(guildId: string) {
    try {
        await client.connect();

        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        });

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        return cursor.role;
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function setOutputTextChannel(channel: string, guildId: string) {
    try {
        await client.connect();
        
        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        });

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        await client.db(DATABASE).collection(GUILDS_COLLECTION).updateOne(
            {
                guildId
            }, {
            $set: {
                channel
            }
        });
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}

export async function getOutputTextChannel(guildId: string) {
    try {
        await client.connect();
                
        const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
            guildId
        });

        if (cursor == null) {
            throw new Error('Unknown GuildID');
        }

        return cursor.channel;
    }
    catch (e) {
        throw e;
    }
    finally {
        await client.close();
    }
}
