import * as vscode from 'vscode';
import util = require('util');
import path = require('path');
import stringify = require('stringify-json');

/**
 *  Gets the uri for the currently opened workspace, if one is opened.
 *
 * @returns WorkspaceFolder | undefined If a workspace is open it returns the WorkspaceFolder Uri, if not undefined is returned
 */
export function getWorkspaceUri(): vscode.Uri | undefined {
  return vscode.workspace.workspaceFolders?.at(0)?.uri;
}

export async function createBackendTraceOutput(backendTrace: BackendTrace, filePath: string) {
  const fileName = path.basename(filePath).split('.')[0];
  await vscode.workspace.fs.writeFile(
    vscode.Uri.parse(vscode.workspace.workspaceFolders![0].uri.path + `/backend_trace_${fileName}.json`),
    new util.TextEncoder().encode(stringify.default(backendTrace))
  );
}

/**
 * Reads a fie with the given uri and decodes the contens to a string and afterwards splits every line into a string array
 *
 * @param fileUri the uri of the file that needs to be retrieved
 * @returns the content of the file in a string array line by line
 */
export async function getFileContent(fileUri: vscode.Uri): Promise<string> {
  return new util.TextDecoder('utf-8').decode(await vscode.workspace.fs.readFile(fileUri));
}

/**
 * Creates a file based on the currently opened editor. If no editor or workspace is open,
 * no file can be created.
 *
 * @returns The uri of a temporarily created file
 */
export async function createTempFileFromCurrentEditor(fileContent: string): Promise<vscode.Uri | undefined> {
  // Create temp file with the content of the python file and add a 'pass' at the end
  // to let the debugger evaluate the last statement of the file
  // Create a temp file in the workspace and delete it afterwards
  const workspaceUri = getWorkspaceUri();
  if (workspaceUri) {
    const tempFileUri = vscode.Uri.joinPath(workspaceUri, 'temp_file.py');
    const utf8Content = new util.TextEncoder().encode(fileContent.concat('\npass'));
    // Workspace is also opened, file can be written and path to file can be returned
    await vscode.workspace.fs.writeFile(tempFileUri, utf8Content);
    return tempFileUri;
  }
}

export function getOpenEditors(): readonly vscode.TextEditor[] {
  return vscode.window.visibleTextEditors;
}
