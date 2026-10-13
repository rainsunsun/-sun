const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1400,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // 安全：渲染进程与 Node 隔离
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
});

// 渲染进程请求：把简历直接保存成 PDF（文字可选中、中文正常）
ipcMain.handle('save-pdf', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: '保存简历 PDF',
    defaultPath: '简历.pdf',
    filters: [{ name: 'PDF 文件', extensions: ['pdf'] }]
  });
  if (canceled || !filePath) {
    return { ok: false, canceled: true };
  }
  // printToPDF 走系统打印引擎，文字是矢量/文本，可选中复制
  // 页边距由页面内边距（padding）控制，这里设为 0，保证和预览完全一致
  const pdf = await win.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    landscape: false,
    margins: { marginType: 'none' }
  });
  fs.writeFileSync(filePath, pdf);
  return { ok: true, filePath };
});

// 关闭所有窗口时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
