#!./node_modules/electron/cli.js
const path = require('path');
const {readFileSync} = require('fs');
const electron = require('electron');
const showdown = require('showdown');
const config = require('./config');

const {app} = electron;
const converter = new showdown.Converter();

let mainWindow;

app.setAppUserModelId('me.dusansimic.checkdown');

function createMainWindow() {
	const lastWindowState = config.get('lastWindowState');

	const win = new electron.BrowserWindow({
		title: app.getName(),
		x: lastWindowState.x,
		y: lastWindowState.y,
		width: lastWindowState.width,
		height: lastWindowState.height,
		icon: process.platform === 'linux' && path.join(__dirname, 'static/Icon.png'),
		autoHideMenuBar: true,
		minWidth: 400,
		minHeight: 200,
		webPreferences: {
			preload: path.join(__dirname, 'browser.js'),
			nodeIntegration: false,
			plugins: false
		}
	});

	win.loadFile(path.join(__dirname, 'index.html'));

	win.on('before-close', () => {
		if (!mainWindow.isFullScreen()) {
			config.set('lastWindowState', mainWindow.getBounds());
		}
	});

	return win;
}

app.on('ready', async () => {
	let mdData;
	if (process.argv[2]) {
		try {
			converter.setFlavor('github');
			mdData = converter.makeHtml(readFileSync(process.argv[2]).toString());
		} catch (e) {
			throw e;
		}
	} else {
		console.error('🤯 No input file specified!');
		process.exit();
	}

	mainWindow = createMainWindow();

	const {webContents} = mainWindow;

	webContents.on('dom-ready', () => {
		mainWindow.webContents.send('md-data', mdData);
	});
});
