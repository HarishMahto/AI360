// AI360 VS Code Extension – Entry Point & Activation
import * as vscode from 'vscode';
import { AuthManager } from './auth/AuthManager';
import { ApiClient } from './api/ApiClient';
import { UsageTracker } from './stats/UsageTracker';
import { ChatViewProvider } from './chat/ChatViewProvider';

export async function activate(context: vscode.ExtensionContext) {
  console.log('AI360 Copilot & FinOps Workspace extension activated.');

  // 1. Initialize Enterprise Services
  const authManager = new AuthManager(context.secrets);
  const usageTracker = new UsageTracker(context.globalState);

  const config = vscode.workspace.getConfiguration('ai360');
  const backendUrl = config.get<string>('backendUrl') || 'http://localhost:8000';
  const apiClient = new ApiClient(backendUrl, authManager);

  // 2. Register Webview Provider
  const chatViewProvider = new ChatViewProvider(
    context.extensionUri,
    apiClient,
    authManager,
    usageTracker
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  // 3. Register Command: Login Employee
  const loginCmd = vscode.commands.registerCommand('ai360.login', async () => {
    await chatViewProvider.openAndFocusTab('settings');
    vscode.window.showInformationMessage('AI360: Enter your enterprise credentials in Settings or connect via web browser.');
  });

  // 4. Register Command: Show Today's AI Usage & Tokens
  const statsCmd = vscode.commands.registerCommand('ai360.showStats', async () => {
    await chatViewProvider.openAndFocusTab('usage');
    const stats = usageTracker.getTodayStats();
    vscode.window.showInformationMessage(`Today's AI Usage: $${stats.costUSD} across ${stats.totalTokens.toLocaleString()} tokens (${stats.requests} requests).`);
  });

  // 5. Register Command: Show Prompt History
  const optimizeCmd = vscode.commands.registerCommand('ai360.optimizeSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      await chatViewProvider.openAndFocusTab('history');
      return;
    }
    const selectedText = editor.document.getText(editor.selection);
    await chatViewProvider.openAndFocusTab('chat');
    await chatViewProvider.injectPromptText(selectedText, false);
  });

  // 6. Register Command: Explain Selected Code
  const explainCmd = vscode.commands.registerCommand('ai360.explainCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      vscode.window.showWarningMessage('AI360: Please highlight a code block in the editor first.');
      return;
    }
    const selectedCode = editor.document.getText(editor.selection);
    const filename = vscode.workspace.asRelativePath(editor.document.uri);
    const prompt = `Explain the architectural execution flow, security properties, and performance profile of this code from \`${filename}\`:\n\n\`\`\`${editor.document.languageId}\n${selectedCode}\n\`\`\``;
    await chatViewProvider.openAndFocusTab('chat');
    await chatViewProvider.injectPromptText(prompt, true);
  });

  // 7. Register Command: Refactor Selected Code
  const refactorCmd = vscode.commands.registerCommand('ai360.refactorCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
      vscode.window.showWarningMessage('AI360: Please select code to refactor.');
      return;
    }
    const selectedCode = editor.document.getText(editor.selection);
    const filename = vscode.workspace.asRelativePath(editor.document.uri);
    const prompt = `Refactor and optimize the following code from \`${filename}\` for modularity, low latency, and strict clean code standards. Provide an interactive apply button:\n\n\`\`\`${editor.document.languageId}\n${selectedCode}\n\`\`\``;
    await chatViewProvider.openAndFocusTab('chat');
    await chatViewProvider.injectPromptText(prompt, true);
  });

  context.subscriptions.push(loginCmd, statsCmd, optimizeCmd, explainCmd, refactorCmd);
}

export function deactivate() {
  console.log('AI360 extension deactivated.');
}
