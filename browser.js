const electron = require('electron');

const {ipcRenderer: ipc} = electron;

ipc.on('md-data', (_event, defaultStatus) => {
	document.querySelector('.markdown-body').innerHTML = defaultStatus;
});
