import path from "path";
import { runShellTask } from "../common/tasks";
import { BuildTreeItem } from "./tree";
import * as vscode from "vscode";
import { showQuickPick } from "../common/quick-pick";

import {
  SimulatorOutput,
  createDirectory,
  getBuildSettings,
  getIsXcbeautifyInstalled,
  getSimulators,
  removeDirectory,
} from "../common/cli/scripts";

export async function askSimulatorToRunOn(): Promise<SimulatorOutput> {
  const output = await getSimulators();

  const device = await showQuickPick({
    title: "Select simulator to run on",
    items: Object.entries(output.devices)
      .map(([key, value]) => {
        return value
          .filter((simulator) => simulator.isAvailable)
          .map((simulator) => {
            return {
              label: simulator.name,
              context: {
                simulator,
              },
            };
          });
      })
      .flat(),
  });

  return device.context.simulator;
}

export async function getWorkspacePath(): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceFolder) {
    throw new Error("No workspace folder found");
  }
  return workspaceFolder;
}

export async function prepareBundleDir(context: vscode.ExtensionContext, schema: string): Promise<string> {
  const storagePath = context.storageUri?.fsPath;
  if (!storagePath) {
    vscode.window.showErrorMessage("No storage path found");
    throw new Error("No storage path found");
  }

  // Creatre folder at storagePath, because vscode doesn't create it automatically
  await createDirectory(storagePath);

  const bundleDir = path.join(storagePath, "bundle", schema);

  // Remove old bundle if exists
  await removeDirectory(bundleDir);

  return bundleDir;
}
