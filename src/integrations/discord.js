const RPC = require('discord-rpc');
const rpcClient = new RPC.Client({ transport: 'ipc' });
const APPLICATION_ID = '1014618385507692635';
RPC.register(APPLICATION_ID);

function onRpcReady() {
    rpcClient.setActivity({
        state: "Discovering the island",
        details: "www.cpatake.boo",
        startTimestamp: Date.now(),
        largeImageKey: "logoicon-onelive",
        instance: true,
    });
}

function initDiscordRichPresence() {
    rpcClient.on('ready', onRpcReady);
    rpcClient.login({
        clientId: APPLICATION_ID
    }).catch(console.error);
}

module.exports = { initDiscordRichPresence }