const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");

ipcMain.on("perform-login", (event) => {
  view.webContents.executeJavaScript(`
      // Your existing login script
  `);
});

let mainWindow;
let view;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Consider changing to true and using contextBridge in production
      preload: __dirname + "/preload.js", // If using contextIsolation: true
    },
  });

  mainWindow.loadFile("index.html");

  view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 100, width: 800, height: 500 }); // Adjusted to accommodate the overlay button
  view.webContents.loadURL("https://enviosecommerce.ctt.pt");

  mainWindow.on("resize", () => {
    const { width, height } = mainWindow.getContentBounds();
    view.setBounds({ x: 0, y: 100, width, height: height - 100 }); // Adjusted for the overlay
  });

  view.webContents.on("dom-ready", () => {
    view.webContents.insertCSS("body { background-color: lightblue; }");
  });

  ipcMain.on("perform-login", (event) => {
    // Execute login script when the "LOGIN" button is clicked
    performLogin();
  });
}

function performLogin() {
  view.webContents.executeJavaScript(`
        (async () => {
            const waitForElement = async (selector) => {
                while (document.querySelector(selector) === null) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            };

            await waitForElement('#LoginName');
            const usernameInput = document.querySelector('#LoginName');
            usernameInput.value = 'MILDINDEXLDA';

            await waitForElement('#PassWord');
            const passwordInput = document.querySelector('#PassWord');
            passwordInput.value = 'pymkas-hikni9-Gicbah';

            await waitForElement('#loginbutton .loginsubmit');
            const loginButton = document.querySelector('#loginbutton .loginsubmit');
            loginButton.click();

            // Check for login failure after a delay to allow for page response
            setTimeout(async () => {
                const errorElement = await document.getElementById('stderror');
                if (errorElement) {
                    mainWindow.webContents.send('login-failed');
                } else {
                    mainWindow.webContents.send('login-success');
                }
            }, 2000); // Adjust delay as needed
        })();
    `);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
