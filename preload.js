const { contextBridge, ipcRenderer } = require('electron');

// 通过 contextBridge 暴露最小接口给渲染进程（不直接暴露 Node 能力，安全）
contextBridge.exposeInMainWorld('api', {
  savePdf: () => ipcRenderer.invoke('save-pdf')
});
