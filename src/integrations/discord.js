const RPC = require('discord-rpc');
const rpcClient = new RPC.Client({ transport: 'ipc' });
const APPLICATION_ID = '1014618385507692635';
RPC.register(APPLICATION_ID);

let states = [];
let currentStateIndex = 0;
let stateInterval;

async function fetchTextContent(url) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        console.error('Error fetching text content:', error);
        return null;
    }
}

async function fetchJsonContent(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON content:', error);
        return null;
    }
}

async function updateStates() {
    const switchContent = await fetchTextContent('https://app.cpatake.boo/assets/desktop/newrpc/switch.txt');
    
    if (switchContent === '0') {
        return {
            state: "Exploring the Island",
            details: "www.cpatake.boo",
            largeImageKey: "prerelease"
        };
    }

    const rpcInfo = await fetchJsonContent('https://app.cpatake.boo/assets/desktop/newrpc/info.json');
    if (!rpcInfo) return null;

    const statesContent = await fetchTextContent(rpcInfo.statesUrl);
    if (statesContent) {
        states = statesContent.split('\n').filter(state => state.trim());
    }

    return {
        state: states[0] || "Exploring the Island",
        details: rpcInfo.details,
        largeImageKey: rpcInfo.largeImageKey
    };
}

function rotateState() {
    if (states.length === 0) return;
    
    currentStateIndex = (currentStateIndex + 1) % states.length;
    rpcClient.setActivity({
        state: states[currentStateIndex],
        details: rpcClient.activity.details,
        largeImageKey: rpcClient.activity.largeImageKey,
        startTimestamp: rpcClient.activity.startTimestamp,
        instance: true,
    });
}

async function onRpcReady() {
    const rpcData = await updateStates();
    if (!rpcData) return;

    rpcClient.setActivity({
        state: rpcData.state,
        details: rpcData.details,
        startTimestamp: Date.now(),
        largeImageKey: rpcData.largeImageKey,
        instance: true,
    });

    if (states.length > 1) {
        stateInterval = setInterval(rotateState, 3 * 60 * 1000);
    }
}

function initDiscordRichPresence() {
    rpcClient.on('ready', onRpcReady);
    rpcClient.login({
        clientId: APPLICATION_ID
    }).catch(console.error);
}

module.exports = { initDiscordRichPresence }