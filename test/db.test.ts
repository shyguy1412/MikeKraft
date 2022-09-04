import { addGuildToDatabase, addServerToWatch, getAllGuildsFromDatabase, getOutputTextChannel, getRoleToPing, getServerStatus, listServersToWatch, removeGuildFromDatabase, removeServerToWatch, setOutputTextChannel, setRoleToPing, setServerStatus, validateDatabase } from "../src/db";
import { mongodb_config } from '../.config.json';
import { MongoClient } from "mongodb";
import { expect } from "chai";

const client = new MongoClient(buildMongoURLFromConfig(mongodb_config));

function buildMongoURLFromConfig(config: { port: number | string; host: string; user: string; pass: string; }): string {
    const { user, pass, host, port } = config;
    return `mongodb://${user}:${pass}\@${host}:${port}`
}

const DATABASE = 'mikekraft';
const GUILDS_COLLECTION = 'guilds';

describe('MikeKraft Database API', () => {

    before(async () => await client.connect());

    it('can connect to the database', done => {
        validateDatabase()
            .then(() => done())
            .catch(err => done(err));
    });

    it('can add a guild', done => {
        addGuildToDatabase('myguild')
            .then(async () => {

                const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
                    guildId: 'myguild'
                });

                expect(cursor).to.not.be.null;
                expect(cursor!.guildId).to.equal('myguild');

                done();
            })
            .catch(err => done(err));
    });


    it('can remove a guild', done => {
        client.db(DATABASE).collection(GUILDS_COLLECTION).insertOne({
            guildId: 'myguild'
        })
            .then(cursor => {
                return removeGuildFromDatabase('myguild');
            })
            .then(async () => {
                const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
                    guildId: 'myguild'
                });

                expect(cursor).to.be.null;

                done();
            })
            .catch(err => done(err));
    });

    it('can list all guilds', done => {
        addGuildToDatabase('myguild')
            .then(() => addGuildToDatabase('myguild2'))
            .then(() => getAllGuildsFromDatabase())
            .then((guilds) => {
                expect(guilds).to.have.length(2);
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can store mc servers to watch', done => {
        addGuildToDatabase('myguild')
            .then(() => addServerToWatch('hypixel.net', 'myguild'))
            .then(async () => {
                const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
                    guildId: 'myguild'
                });
                expect(cursor!.servers['hypixel.net']).to.be.false;
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can remove mc servers to watch', done => {
        addGuildToDatabase('myguild')
            .then(() => addServerToWatch('hypixel.net', 'myguild'))
            .then(() => removeServerToWatch('hypixel.net', 'myguild'))
            .then(async () => {
                const cursor = await client.db(DATABASE).collection(GUILDS_COLLECTION).findOne({
                    guildId: 'myguild'
                });
                expect(cursor!.servers['hypixel.net']).to.be.undefined;
            })
            .then(() => done())
            .catch(err => done(err));
    });


    it('can list mc servers to watch', done => {
        addGuildToDatabase('myguild')
            .then(() => addServerToWatch('hypixel.net', 'myguild'))
            .then(() => addServerToWatch('foobar.net', 'myguild'))
            .then(() => listServersToWatch('myguild'))
            .then(async (servers) => {
                expect(Object.keys(servers)).to.be.length(2);
            })
            .then(() => done())
            .catch(err => done(err));
    });


    it('can get mc server status', done => {
        addGuildToDatabase('myguild')
            .then(() => addServerToWatch('hypixel.net', 'myguild'))
            .then(() => getServerStatus('hypixel.net', 'myguild'))
            .then(async (status) => {
                expect(status).to.be.false;
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can set mc server status', done => {
        addGuildToDatabase('myguild')
            .then(() => addServerToWatch('hypixel.net', 'myguild'))
            .then(() => setServerStatus('hypixel.net', true, 'myguild'))
            .then(() => getServerStatus('hypixel.net', 'myguild'))
            .then(async (status) => {
                expect(status).to.be.true;
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can get role to ping', done => {
        addGuildToDatabase('myguild')
            .then(() => getRoleToPing('myguild'))
            .then(async (role) => {
                expect(role).to.equal('everyone');
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can set role to ping', done => {
        addGuildToDatabase('myguild')
            .then(() => setRoleToPing('new role', 'myguild'))
            .then(() => getRoleToPing('myguild'))
            .then(async (role) => {
                expect(role).to.equal('new role');
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can get output text channel', done => {
        addGuildToDatabase('myguild')
            .then(() => getOutputTextChannel('myguild'))
            .then(async (channel) => {
                expect(channel).to.equal('');
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it('can set output text channel', done => {
        addGuildToDatabase('myguild')
            .then(() => setOutputTextChannel('channel', 'myguild'))
            .then(() => getOutputTextChannel('myguild'))
            .then(async (channel) => {
                expect(channel).to.equal('channel');
            })
            .then(() => done())
            .catch(err => done(err));
    });

    afterEach(async () => {
        await client.db(DATABASE).collection(GUILDS_COLLECTION).drop();
    })

    after(async () => {
        await client.close()
    });
})
