#! /usr/bin/env electron
'use strict';
var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.

require('crash-reporter').start();

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	if (process.platform != 'darwin') app.quit();
});

app.on('ready', function () {
	var mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		title: 'Defender',
		fullscreen: false,
		frame: false,
		transparent: true
		});

	mainWindow.on('closed', function () {
		app.quit();
	});

	mainWindow.loadUrl(`file://${__dirname}/index.html`);
});
