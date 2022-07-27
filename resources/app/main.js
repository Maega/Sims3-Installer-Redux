// Modules to control application life and create native browser window
const {app, ipcMain, BrowserWindow} = require('electron');
const remote = require('@electron/remote/main');
remote.initialize();

let mainWindow;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 800,
    minHeight: 400,
    transparent: true,
    titleBarStyle: 'hidden', // Hide titleBar since we'll use our own custom controls
    frame: true,
    webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
    }
  })

  // Load app frontend
  mainWindow.loadFile('index.html');

  // Open DevTools (debug)
  //mainWindow.webContents.openDevTools();

  // Enable remote module
  remote.enable(mainWindow.webContents);

  return mainWindow;

};

// When Electron finishes initialising, create the main app window and assign
// the BrowserWindow instance it returns to the app scoped mainWindow variable.
app.whenReady().then(() => mainWindow = createWindow());

// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());

// IPC Events
ipcMain.on('startInstall', async (event, installList) => {

    const cmd = require('node-cmd');
    console.log(installList);
    
    // Define the browser window.
    const installWindow = new BrowserWindow({
        width: 900,
        height: 600,
        minWidth: 900,
        minHeight: 600,
        parent: mainWindow,
        modal: true,
        titleBarStyle: 'hidden',
        alwaysOnTop: true,
        /* titleBarOverlay: {
          color: '#171717',
          symbolColor: '#fff'
        }, */
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    const softwareDict = require('./software.json');

    const doInstall = (installCmd) => {

        return new Promise((resolve, reject) => {
            cmd.run(installCmd, function(err, data, stderr) {
                err || stderr ? reject(stderr) : resolve(data);
            });
        });

    }

    const errors = [];
    
    for (const [index, targetApp] of installList.entries()) {

        console.log('Current Index: ' + index);

        const target = softwareDict.find(thisApp => thisApp.id === targetApp);
        console.log('Current Target App: ' + target.name);

        // Load doinstall.html & pass the current target app's metadata as a query string.
        installWindow.loadFile('doinstall.html', {query: {progress: index, total: installList.length, target: JSON.stringify(target)}});
        
        try {
            const installResult = await doInstall(`software\\${target.installCmd}`);
            console.log(JSON.stringify(installResult));
        } catch (err) {
            console.error(`${target.name} failed to install: ${err}`);
            errors.push(`<b>${target.name}:</b> ${err || 'Unknown Error'}`);
        }
        
        console.log(target.name + ' INSTALL IS DONE!!');

    }

    installWindow.close();

    event.returnValue = errors;

});