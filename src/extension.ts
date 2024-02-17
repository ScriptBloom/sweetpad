import * as vscode from "vscode";

import { BuildTreeProvider } from "./build/tree.js";
import { buildAndRunCommand, buildCommand, removeBundleDirCommand } from "./build/commands.js";
import { preloadExec } from "./common/exec.js";
import { formatCommand, showLogsCommand } from "./format/commands.js";
import { createFormatStatusItem } from "./format/status.js";
import { createFormatProvider } from "./format/provider.js";
import {
  openSimulatorCommand,
  removeSimulatorCacheCommand,
  startSimulatorCommand,
  stopSimulatorCommand,
} from "./simulators/commands.js";
import { SimulatorsTreeProvider } from "./simulators/tree.js";
import { ToolTreeProvider } from "./tools/tree.js";
import { installToolCommand, openDocumentationCommand } from "./tools/commands.js";

export function activate(context: vscode.ExtensionContext) {
  // shortcut to push disposable to context.subscriptions
  const p = (disposable: vscode.Disposable) => context.subscriptions.push(disposable);

  // Preload exec function to avoid delay on first exec call
  void preloadExec();

  function registerCommand(command: string, callback: (context: vscode.ExtensionContext, ...args: any[]) => void) {
    return vscode.commands.registerCommand(command, (...args: any[]) => callback(context, ...args));
  }

  // Trees 🎄
  const simulatorsTreeProvider = new SimulatorsTreeProvider();
  const buildTreeProvider = new BuildTreeProvider({
    simulatorsTree: simulatorsTreeProvider,
  });

  // Build
  p(vscode.window.registerTreeDataProvider("sweetpad.build.view", buildTreeProvider));
  p(registerCommand("sweetpad.build.refresh", () => buildTreeProvider.refresh()));
  p(registerCommand("sweetpad.build.buildAndRun", buildAndRunCommand));
  p(registerCommand("sweetpad.build.build", buildCommand));
  p(registerCommand("sweetpad.build.removeBundleDir", removeBundleDirCommand));
  // Format
  p(createFormatStatusItem());
  p(createFormatProvider());
  p(registerCommand("sweetpad.format.run", formatCommand));
  p(registerCommand("sweetpad.format.showLogs", showLogsCommand));

  // Simulators
  p(vscode.window.registerTreeDataProvider("sweetpad.simulators.view", simulatorsTreeProvider));
  p(registerCommand("sweetpad.simulators.refresh", () => simulatorsTreeProvider.refresh()));
  p(registerCommand("sweetpad.simulators.openSimulator", openSimulatorCommand));
  p(registerCommand("sweetpad.simulators.removeCache", removeSimulatorCacheCommand));
  p(registerCommand("sweetpad.simulators.start", startSimulatorCommand));
  p(registerCommand("sweetpad.simulators.stop", stopSimulatorCommand));

  // Tools
  const toolsTreeProvider = new ToolTreeProvider();
  p(vscode.window.registerTreeDataProvider("sweetpad.tools.view", toolsTreeProvider));
  p(registerCommand("sweetpad.tools.install", installToolCommand));
  p(registerCommand("sweetpad.tools.refresh", () => toolsTreeProvider.refresh()));
  p(registerCommand("sweetpad.tools.documentation", openDocumentationCommand));
}

export function deactivate() {}
