const {app, BrowserWindow, dialog, Menu, MenuItem, shell} = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');

//const {app, BrowserWindow} = require('electron');
const path = require('path');
const gotTheLock = app.requestSingleInstanceLock()

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
  ["Main", "https://3.cpatake.net/1/?from=client3.1-switcher"], 
  ["AS3", "https://3.cpatake.net/redirects/3.1/as3"], 
  ["AS2", "https://3.cpatake.net/redirects/3.1/as2"],
  ["AS1", "https://3.cpatake.net/redirects/3.1/as1"],
  ["TV", "https://3.cpatake.net/redirects/3.1/tv"],
  ["EP", "https://3.cpatake.net/redirects/3.1/ep"],
  ["AS2 (CPPSCreator)", "https://3.cpatake.net/redirects/3.1/as2/cc"]
]

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
        title: "About CP Atake App",
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
    label: 'Layout switcher',
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
  if (!url.includes("cpatake.net")) {
    event.preventDefault();
    shell.openExternal(url);
  }
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
  mainWindow.loadURL('https://3.cpatake.net/1/');

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);

  // RICH PRESENCE START
  const clientId = '1014618385507692635'; DiscordRPC.register(clientId); const rpc = new DiscordRPC.Client({ transport: 'ipc' }); const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: 'cpatake.net', 
      state: 'Desktop App',
      startTimestamp,
      largeImageKey: 'applargeimage',
      //largeImageText: "LARGE IMAGE TEXT",
      smallImageKey: "appsmallimage"
      //smallImageText: "SMALL IMAGE TEXT"
    });
  });
  rpc.login({ clientId }).catch(console.error);

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
