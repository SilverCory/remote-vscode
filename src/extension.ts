'use strict';
import * as vscode from 'vscode';
import Server from './lib/Server';
import Logger from './utils/Logger';

const L = Logger.getLogger('extension');

var server : Server;
var changeConfigurationDisposable : vscode.Disposable;
var port : number;
var onStartup : boolean;

const startServer = () => {
  L.trace('startServer');

  if (!server) {
    server = new Server();
  }

  server.setPort(port);
  server.start(false);
};

const stopServer = () => {
  L.trace('stopServer');

  if (server) {
    server.stop();
  }
};

const initialize = () => {
  L.trace('initialize');

  var configuration = getConfiguration();
  onStartup = configuration.onStartup;
  port = configuration.port;

  if (onStartup) {
    startServer();
  }
};

const getConfiguration = () => {
  L.trace('getConfiguration');
  var remoteConfig = vscode.workspace.getConfiguration('remote');

  var configuration = {
    onStartup: remoteConfig.get<boolean>('onstartup'),
    port: remoteConfig.get<number>('port')
  };

  L.debug("getConfiguration", configuration);

  return configuration;
};

const hasConfigurationChanged = (configuration) => {
  L.trace('hasConfigurationChanged');
  var hasChanged = configuration.port !== port || configuration.onStartup !== onStartup;

  L.debug("hasConfigurationChanged?", hasChanged);
  return hasChanged;
}

const onConfigurationChange = () => {
  L.trace('onConfigurationChange');

  var configuration = getConfiguration();

  if (hasConfigurationChanged(configuration)) {
    initialize();
  }
};

export function activate(context: vscode.ExtensionContext) {
  initialize();

	context.subscriptions.push(vscode.commands.registerCommand('extension.startServer', startServer));
  context.subscriptions.push(vscode.commands.registerCommand('extension.stopServer', stopServer));

  changeConfigurationDisposable = vscode.workspace.onDidChangeConfiguration(onConfigurationChange);
}

export function deactivate() {
  stopServer();
  changeConfigurationDisposable.dispose();
}
