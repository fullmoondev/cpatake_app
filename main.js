const {app, BrowserWindow, dialog, Menu, MenuItem, shell, ipcMain} = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');

//const {app, BrowserWindow} = require('electron');
const path = require('path');
const gotTheLock = app.requestSingleInstanceLock()
const startTimestamp = new Date();

const buttons = [
  { label: 'Discord', url: 'https://discord.gg/Yaj3wrSsPW' }
]

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let pluginName;
switch (process.platform) {
  case 'win32':
    pluginName = 'flash/pepflashplayer64_32_0_0_303.dll';
    break;
  case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin';
    break;
  case 'linux':
    app.commandLine.appendSwitch('no-sandbox')
    pluginName = 'flash/libpepflashplayer.so';
    break;
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

let playPages = [
  ["Home", "https://butterfly.cpatake.dink.cf/start/4.0"],
  ["AS3", "https://butterfly.cpatake.dink.cf/redirects/4.0/as3"],
  ["AS2", "https://butterfly.cpatake.dink.cf/redirects/4.0/as2"],
  ["AS1", "https://butterfly.cpatake.dink.cf/redirects/4.0/as1"],
  ["TV", "https://butterfly.cpatake.dink.cf/redirects/4.0/tv"],
  ["EP", "https://butterfly.cpatake.dink.cf/redirects/4.0/ep"],
  ["PC", "https://butterfly.cpatake.dink.cf/redirects/4.0/pc"],
  ["PC3", "https://butterfly.cpatake.dink.cf/redirects/4.0/pc3"],
  ["AS2 (CPPSCreator)", "https://butterfly.cpatake.dink.cf/redirects/4.0/as2/cc"]
]

function setDiscordPresence() {
  rpc.setActivity({
      details: checkVersionPlayed(),
      state: 'Desktop App 4.0',
      startTimestamp,
      largeImageKey: 'dynamic3-big',
      buttons: buttons
  }).catch(console.error);
}

function setupZonePresence(zoneId, penguinName) {
  var roomIdToName = {
      100: 'Town Center',
      110: 'Coffee Shop',
      111: 'Book Room',
      120: 'Night Club',
      121: checkVersionPlayed() == 'AS2' ? 'Dance Lounge' : 'Arcade',
      952: 'Dance Contest',
      900: 'Astro Barrier',
      909: 'Thin Ice',
      320: 'Dojo',
      130: checkVersionPlayed() == 'AS2' ? 'Gift Shop' : 'Clothes Shop',
      959: 'Smoothie Smash',
      300: 'The Plaza',
      310: 'Pet Shop',
      955: 'Puffle Launch',
      956: 'Bits & Bolts',
      998: 'Card Jitsu',
      951: 'Sensei',
      211: 'Everyday Phoning Facility',
      323: 'EPF Command Room'
  }

  var roomIdToImage = {
      100: checkVersionPlayed() == 'AS2' ? 'town_2006_ice_rink' : 'town_2012_ice_rink',
      110: checkVersionPlayed() == 'AS2' ? 'coffee_shop_as2' : 'coffee_shop_2012',
      111: checkVersionPlayed() == 'AS2' ? 'book_room_2005' : 'book_room_2012',
      120: checkVersionPlayed() == 'AS2' ? 'night_club_as2' : 'dance_club_july_2014',
      121: checkVersionPlayed() == 'AS2' ? 'dance_lounge_2006' : 'arcade',
      952: 'dance_contest_logo',
      900: 'astrobarrierstartscreennewfont',
      909: 'thin_ice',
      320: checkVersionPlayed() == 'AS2' ? 'dojo_2009' : 'dojo_2013',
      130: checkVersionPlayed() == 'AS2' ? 'gift_shop_2009': 'clothes_shop',
      959: 'ss_game_menu',
      300: checkVersionPlayed() == 'AS2' ? 'plaza_before_2012' : 'plaza08july2015',
      310: checkVersionPlayed() == 'AS2' ? 'pet_shop_2010' : 'pet_shop_2014',
      955: 'puffle_launch',
      956: 'bits-and-bolts',
      998: 'card_jitsu_deck',
      951: 'sensei',
      211: 'everyday_phoning_facility',
      323: 'epf_command_room_2010_2'
  }

  rpc.setActivity({
      details: penguinName,
      state: roomIdToName[zoneId] || 'Desktop App 4.0',
      startTimestamp,
      largeImageKey: roomIdToImage[zoneId] || 'dynamic3-big',
      largeImageText: checkVersionPlayed(),
      buttons: button
  }).catch(console.error);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.checkForUpdatesAndNotify();
let mainWindow;
let fsmenu;

function makeLayoutSwitcher() {
  LayoutSwitcher = new Menu();
  playPages.forEach((playPage, index) => {
    LayoutSwitcher.append(new MenuItem({
      label: playPage[0],
      click: () => {
        mainWindow.loadURL(playPage[1]);
        setDiscordPresence();
      }
    }));
  });
  return LayoutSwitcher;
}

function makeMenu() {
  fsmenu = new Menu();
  fsmenu.append(new MenuItem({
    label: 'About',
    click: () => {
      dialog.showMessageBox({
        type: "info",
        buttons: ["Ok"],
        title: "About Club Penguin Atake App",
        message: "Club Penguin Atake Desktop App\nClub Penguin Atake © Moonlight Studios.\nBase client: © 2020 daniel11420 / the Frosty Team\nLicense:\n" + fs.readFileSync('resources/app/LICENSE')
      });
    }
  }));
  fsmenu.append(new MenuItem({
    label: 'Fullscreen (Toggle)',
    accelerator: 'CmdOrCtrl+F',
    click: () => {
      let fsbool = (mainWindow.isFullScreen() ? false : true);
      mainWindow.setFullScreen(fsbool);
    }
  }));
  fsmenu.append(new MenuItem({
    label: 'Mute Audio (Toggle)',
    click: () => {
      let ambool = (mainWindow.webContents.audioMuted ? false : true);
      mainWindow.webContents.audioMuted = ambool;
    }
  }));
  fsmenu.append(new MenuItem({
    label: 'Version switcher',
    type: 'submenu',
    submenu: makeLayoutSwitcher()
  }));
  fsmenu.append(new MenuItem({
    label: 'Log Out',
    click: () => {
      mainWindow.reload();
    }
  }));
}

function clearCache() {
  if (mainWindow !== null) {mainWindow.webContents.session.clearCache();}
}

function handleRedirect(event, url) {
  if (!url.includes("cpatake.dink.cf")) {
    event.preventDefault();
    shell.openExternal(url);
  }
}

function checkVersionPlayed() {
  let currentURL = mainWindow.webContents.getURL();

  if (currentURL.includes('as2-cpa')) {
      // This is the AS2 client.
      return 'AS2';
  }

  if (currentURL.includes('as3-cpa')) {
    // AS3 client
    return 'AS3';
  }

  return 'Selecting game version';
}

/**
 * Activates Discord Rich Presence
 * @returns {void}
 */
let rpc;
function activateRPC() {
    DiscordRPC.register('1014618385507692635');
    rpc = new DiscordRPC.Client({
        transport: 'ipc'
    });
    rpc.on('ready', () => {
        setDiscordPresence();
    });
    rpc.login({
        clientId: '1014618385507692635'
    }).catch(console.error);
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1513,
    height: 823,
    title: 'Connecting to Club Penguin Atake...',
    icon: __dirname + '/build/icon.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      plugins: true
    }
  });


  mainWindow.setMenu(null);
  clearCache();
  mainWindow.loadURL('https://butterfly.cpatake.dink.cf/start/4.0');

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);

  // RICH PRESENCE START
  activateRPC();

  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', function () {
  createWindow();
  makeMenu();
  Menu.setApplicationMenu(fsmenu);
});

app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {app.quit();}
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {createWindow();}
});


setInterval(clearCache, 1000*60*5);

// Discord Rich Presence
ipcMain.on('setDiscordZone', function (event, zoneId, penguinName) {
  setupZonePresence(zoneId, penguinName);
});
