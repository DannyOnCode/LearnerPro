const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    performLoginAndDownload: (url : string) => electron.ipcRenderer.invoke('perform-login-and-download', url)
})