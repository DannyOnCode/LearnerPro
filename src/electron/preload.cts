const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    performLoginAndDownload: (url: string, lecture_name: string) => electron.ipcRenderer.invoke('perform-login-and-download', url, lecture_name),
    getVideos: () => electron.ipcRenderer.invoke('get-videos'),
    getNote: (videoPath: string) => electron.ipcRenderer.invoke('get-note', videoPath),
    saveNote: (videoPath: string, content: string) => electron.ipcRenderer.invoke('save-note', videoPath, content),
})