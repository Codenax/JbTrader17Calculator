const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");

let win;
let tray = null;
let store;

/* =========================
   SINGLE INSTANCE LOCK
========================= */
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
}

/* =========================
   CREATE WINDOW
========================= */
async function createWindow() {
  const Store = (await import("electron-store")).default;
  store = new Store();

  const savedBounds = store.get("windowBounds");

  win = new BrowserWindow({
    width: savedBounds?.width || 230,
    height: savedBounds?.height || 310,
    x: savedBounds?.x,
    y: savedBounds?.y,

    minWidth: 230,
    minHeight: 310,

    frame: false,
    transparent: false, // 🔥 CHANGE
    alwaysOnTop: true, // 🔥 CHANGE
    resizable: true,

    fullscreen: false,
    fullscreenable: true,

    show: false,

    icon: path.join(__dirname, "icon10.ico"),

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");

  win.once("ready-to-show", () => {
    win.show();
  });

  /* SAVE WINDOW STATE */
  const saveBounds = () => {
    if (win && !win.isDestroyed()) {
      store.set("windowBounds", win.getBounds());
    }
  };

  win.on("resize", saveBounds);
  win.on("move", saveBounds);

  win.on("close", (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }
    saveBounds();
  });

  win.on("minimize", (e) => {
    e.preventDefault();
    win.hide();
  });
}

/* =========================
   APP START
========================= */
app.whenReady().then(async () => {
  const Store = (await import("electron-store")).default;
  store = new Store();

  /* AUTO START */
  let autoStart = store.get("autoStart");

  if (autoStart === undefined) {
    autoStart = true;
    store.set("autoStart", true);
  }

  const setAutoStart = (value) => {
    autoStart = value;
    store.set("autoStart", value);

    app.setLoginItemSettings({
      openAtLogin: value,
      path: process.execPath,
      args: [],
    });
  };

  app.setLoginItemSettings({
    openAtLogin: autoStart,
    path: process.execPath,
    args: [],
  });

  await createWindow();

  /* =========================
     SYSTEM TRAY
  ========================= */
  tray = new Tray(path.join(__dirname, "icon10.ico"));

  const buildMenu = () =>
    Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => win.show(),
      },
      {
        label: "Hide App",
        click: () => win.hide(),
      },
      {
        type: "separator",
      },
      {
        label: "Start with Windows",
        type: "checkbox",
        checked: autoStart,
        click: (item) => setAutoStart(item.checked),
      },
      {
        type: "separator",
      },
      {
        label: "Exit",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

  tray.setToolTip("JbTrader17 Trading Terminal");
  tray.setContextMenu(buildMenu());

  tray.on("click", () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });
});

/* =========================
   IPC CONTROLS (FIXED)
========================= */

// MINIMIZE
ipcMain.on("window-minimize", () => {
  if (!win) return;
  win.minimize();
});

// FULLSCREEN TOGGLE (FIXED STABLE VERSION)
ipcMain.on("window-toggle-fullscreen", () => {
  if (!win) return;

  const isFull = win.isFullScreen();

  win.setFullScreen(!isFull);
});

// CLOSE
ipcMain.on("window-close", () => {
  if (!win) return;
  win.close();
});

/* =========================
   SAFE EXIT
========================= */
app.on("before-quit", () => {
  app.isQuiting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
