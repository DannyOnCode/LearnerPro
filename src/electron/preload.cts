const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    performLoginAndDownload: (url: string, lecture_name: string) => electron.ipcRenderer.invoke('perform-login-and-download', url, lecture_name),
})