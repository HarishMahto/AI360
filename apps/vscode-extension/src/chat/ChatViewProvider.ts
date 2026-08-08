// AI360 VS Code Extension – Minimalist Chat, Telemetry & Auto-Optimizing Masking Provider
import * as vscode from 'vscode';
import * as path from 'path';
import { ApiClient } from '../api/ApiClient';
import { AuthManager } from '../auth/AuthManager';
import { UsageTracker } from '../stats/UsageTracker';
import { marked } from 'marked';

export const SUPPORTED_MODELS = [
  { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', tier: 'Pro / Coding' },
  { id: 'gemini-3.5-pro', label: 'Gemini 3.5 Pro', tier: 'Pro / Reasoning' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', tier: 'Fast & Low Cost' },
  { id: 'gpt-4o', label: 'GPT-4o', tier: 'Omni / General' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', tier: 'Efficient' },
];

export interface PromptHistoryEntry {
  id: string;
  timestamp: string;
  prompt: string;
  model: string;
}

export function maskSensitiveData(text: string): { sanitizedText: string; maskedCount: number; maskedTypes: string[] } {
  let maskedCount = 0;
  const maskedTypes: string[] = [];
  let sanitizedText = text;

  // 1. API Keys & Bearer Tokens
  const apiKeyRegex = /(sk-[a-zA-Z0-9]{32,})|(AIzaSy[a-zA-Z0-9_-]{33})|(ghp_[a-zA-Z0-9]{36})|(Bearer\s+ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g;
  sanitizedText = sanitizedText.replace(apiKeyRegex, () => {
    maskedCount++;
    if (!maskedTypes.includes('API Key / Secret Token')) maskedTypes.push('API Key / Secret Token');
    return '[MASKED_API_KEY]';
  });

  // 2. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  sanitizedText = sanitizedText.replace(emailRegex, () => {
    maskedCount++;
    if (!maskedTypes.includes('Email Address')) maskedTypes.push('Email Address');
    return '[MASKED_EMAIL]';
  });

  // 3. Password & Secret Declarations
  const secretKeyRegex = /(password|passwd|secret|token|api_key|access_key)\s*[:=]\s*["']?([^"'\s,]+)["']?/gi;
  sanitizedText = sanitizedText.replace(secretKeyRegex, (_match, key) => {
    maskedCount++;
    if (!maskedTypes.includes('Password Credentials')) maskedTypes.push('Password Credentials');
    return `${key}: "[MASKED_SECRET]"`;
  });

  // 4. Private Keys
  const privateKeyRegex = /-----BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY-----[\s\S]*?-----END \1 KEY-----/g;
  sanitizedText = sanitizedText.replace(privateKeyRegex, () => {
    maskedCount++;
    if (!maskedTypes.includes('Private RSA Key')) maskedTypes.push('Private RSA Key');
    return '[MASKED_PRIVATE_KEY]';
  });

  return { sanitizedText, maskedCount, maskedTypes };
}

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ai360.chatView';
  private static readonly PROMPT_HISTORY_KEY = 'ai360.promptHistory';

  private _view?: vscode.WebviewView;
  private messages: Array<{ role: string; content: string; id: string; htmlContent?: string; meta?: any }> = [];
  private selectedModel = 'claude-3-5-sonnet-20241022';
  private activeTab: 'chat' | 'usage' | 'recommendations' | 'history' | 'settings' = 'chat';

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly apiClient: ApiClient,
    private readonly authManager: AuthManager,
    private readonly usageTracker: UsageTracker
  ) {
    this.authManager.onDidAuthChange(() => {
      this._updateWebviewState();
    });
    this.usageTracker.onDidUpdateStats(() => {
      this._sendStatsUpdate();
    });
  }

  public async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case 'sendMessage':
          await this._handleSendMessage(msg.content);
          break;
        case 'previewOptimization':
          await this._handlePreviewOptimization(msg.content);
          break;
        case 'applyCode':
          await this._handleApplyCodeToWorkspace(msg.code, msg.filepath);
          break;
        case 'writeFile':
          await this._handleWriteFileToWorkspace(msg.code, msg.filepath);
          break;
        case 'changeModel':
          this.selectedModel = msg.model;
          break;
        case 'switchTab':
          this.activeTab = msg.tab;
          break;
        case 'loginEmployee':
          await this._handleLoginEmployee(msg.email, msg.password);
          break;
        case 'logout':
          await this.authManager.logout();
          vscode.window.showInformationMessage('AI360: Employee signed out.');
          break;
        case 'openWebDashboard':
          await vscode.env.openExternal(vscode.Uri.parse('https://ai360-c1b0b.web.app/login'));
          break;
        case 'clearHistory':
          this.messages = [];
          this._postMessage({ type: 'clearMessages' });
          break;
        case 'addFileContext':
          await this._handleAddFileContext();
          break;
        case 'applyRecommendationAction':
          await this._handleRecommendationAction(msg.command);
          break;
        case 'requestInitialState':
          await this._updateWebviewState();
          break;
      }
    });

    await this._updateWebviewState();
  }

  public async openAndFocusTab(tab: 'chat' | 'usage' | 'recommendations' | 'history' | 'settings'): Promise<void> {
    this.activeTab = tab;
    if (this._view) {
      this._view.show(true);
      this._postMessage({ type: 'setActiveTab', tab });
    } else {
      await vscode.commands.executeCommand('workbench.view.extension.ai360-sidebar');
    }
  }

  public async injectPromptText(text: string, executeImmediately = false): Promise<void> {
    await this.openAndFocusTab('chat');
    this._postMessage({ type: 'setInputValue', text });
    if (executeImmediately) {
      await this._handleSendMessage(text);
    }
  }

  private async _getPromptHistory(): Promise<PromptHistoryEntry[]> {
    return this.usageTracker['globalState'].get<PromptHistoryEntry[]>(ChatViewProvider.PROMPT_HISTORY_KEY) || [];
  }

  private async _savePromptHistory(prompt: string): Promise<PromptHistoryEntry[]> {
    const existing = await this._getPromptHistory();
    const entry: PromptHistoryEntry = {
      id: 'p-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prompt,
      model: this.selectedModel
    };
    existing.unshift(entry);
    const trimmed = existing.slice(0, 50);
    await this.usageTracker['globalState'].update(ChatViewProvider.PROMPT_HISTORY_KEY, trimmed);
    return trimmed;
  }

  private async _updateWebviewState(): Promise<void> {
    const isAuth = await this.authManager.isAuthenticated();
    const profile = await this.authManager.getUser();
    const stats = this.usageTracker.getTodayStats();
    const recommendations = await this.apiClient.getRecommendations();
    const history = await this._getPromptHistory();

    this._postMessage({
      type: 'stateUpdate',
      isAuthenticated: isAuth,
      profile: profile,
      stats: stats,
      recommendations: recommendations,
      promptHistory: history,
      selectedModel: this.selectedModel,
      activeTab: this.activeTab
    });
  }

  private _sendStatsUpdate(): void {
    const stats = this.usageTracker.getTodayStats();
    this._postMessage({ type: 'updateStats', stats });
  }

  private async _handlePreviewOptimization(content: string): Promise<void> {
    if (!content.trim()) {
      this._postMessage({ type: 'clearOptimizationPreview' });
      return;
    }

    const { sanitizedText, maskedCount, maskedTypes } = maskSensitiveData(content);
    const optResult = await this.apiClient.optimizePrompt(sanitizedText);

    this._postMessage({
      type: 'showOptimizationPreview',
      rawContent: content,
      sanitizedText,
      maskedCount,
      maskedTypes,
      optimizedPrompt: optResult.optimizedPrompt,
      score: optResult.newScore || optResult.originalScore,
      savingsPercent: optResult.tokenSavingsPercent || 28
    });
  }

  private async _handleSendMessage(content: string): Promise<void> {
    if (!content.trim()) return;

    const isAuth = await this.authManager.isAuthenticated();
    if (!isAuth) {
      vscode.window.showWarningMessage('AI360: Please log in with your employee credentials in Settings.');
      this._postMessage({ type: 'setActiveTab', tab: 'settings' });
      return;
    }

    const { sanitizedText, maskedCount, maskedTypes } = maskSensitiveData(content);
    if (maskedCount > 0) {
      vscode.window.showInformationMessage(`AI360 Security: Automatically sanitized ${maskedCount} sensitive item(s) (${maskedTypes.join(', ')}).`);
    }

    const optResult = await this.apiClient.optimizePrompt(sanitizedText);
    const finalPromptToSend = optResult.optimizedPrompt || sanitizedText;

    const updatedHistory = await this._savePromptHistory(sanitizedText);
    this._postMessage({ type: 'updateHistory', promptHistory: updatedHistory });

    const editor = vscode.window.activeTextEditor;
    const activeFile = editor ? vscode.workspace.asRelativePath(editor.document.uri) : undefined;
    const selectedText = editor ? editor.document.getText(editor.selection) : undefined;

    const userMsgId = Date.now().toString();
    const userMsg = {
      role: 'user',
      content: sanitizedText,
      id: userMsgId,
      htmlContent: this.renderMarkdownWithAgentTools(sanitizedText),
      meta: { maskedCount, maskedTypes, score: optResult.originalScore }
    };
    this.messages.push(userMsg);
    this._postMessage({ type: 'addMessage', message: userMsg, optimizedContent: optResult.optimizedPrompt });
    this._postMessage({ type: 'setLoading', loading: true });

    try {
      const response = await this.apiClient.sendAgentChat(
        this.messages.map(m => ({ role: m.role, content: m.content })),
        this.selectedModel,
        { activeFile, selectedText }
      );

      const aiMsgId = (Date.now() + 1).toString();
      const aiHtml = this.renderMarkdownWithAgentTools(response.content);

      const record = await this.usageTracker.recordUsage(
        this.selectedModel,
        finalPromptToSend,
        response.content,
        'chat',
        { input: Math.round(response.totalTokens * 0.55), output: Math.round(response.totalTokens * 0.45), costUSD: response.estimatedCostUSD }
      );

      const aiMsg = {
        role: 'assistant',
        content: response.content,
        id: aiMsgId,
        htmlContent: aiHtml,
        meta: { cost: record.costUSD, tokens: record.totalTokens, model: this.selectedModel, inputTokens: response.inputTokens, outputTokens: response.outputTokens }
      };

      this.apiClient.sendTelemetry(finalPromptToSend, optResult.originalScore, response.inputTokens, response.outputTokens, response.totalTokens, this.selectedModel).catch(e => console.error(e));

      this.messages.push(aiMsg);
      this._postMessage({ type: 'addMessage', message: aiMsg, meta: aiMsg.meta });
    } catch (err: any) {
      const errorMsg = {
        role: 'error',
        content: `Agent Service Error: ${err.message}`,
        id: 'err-' + Date.now(),
        htmlContent: `<div style="padding: 6px 8px; background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.25); border-radius: 3px; color: #FF6B6B; font-size: 11px;">Agent Error: ${err.message}</div>`
      };
      this._postMessage({ type: 'addMessage', message: errorMsg });
    } finally {
      this._postMessage({ type: 'setLoading', loading: false });
    }
  }

  private async _handleApplyCodeToWorkspace(code: string, filepath?: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('AI360: No active file open in editor.');
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const edit = new vscode.WorkspaceEdit();

    if (!selection.isEmpty) {
      edit.replace(document.uri, selection, code);
    } else {
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      );
      edit.replace(document.uri, fullRange, code);
    }

    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      await document.save();
      vscode.window.showInformationMessage(`AI360: Applied changes to ${path.basename(document.uri.fsPath)}.`);
      await this.usageTracker.recordUsage(this.selectedModel, 'Apply code to editor', code, 'agent_code', { input: 120, output: code.length / 4, costUSD: 0.0015 });
    } else {
      vscode.window.showErrorMessage('AI360: Failed to apply edits to document.');
    }
  }

  private async _handleWriteFileToWorkspace(code: string, filepath?: string): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      vscode.window.showErrorMessage('AI360: No workspace folder open in VS Code.');
      return;
    }

    const targetPath = filepath || 'src/generated_output.ts';
    const absUri = vscode.Uri.joinPath(folders[0].uri, targetPath);

    try {
      const parentDir = vscode.Uri.file(path.dirname(absUri.fsPath));
      await vscode.workspace.fs.createDirectory(parentDir);

      const buffer = new TextEncoder().encode(code);
      await vscode.workspace.fs.writeFile(absUri, buffer);

      const doc = await vscode.workspace.openTextDocument(absUri);
      await vscode.window.showTextDocument(doc);
      vscode.window.showInformationMessage(`AI360: Created file at ${targetPath}`);
      
      await this.usageTracker.recordUsage(this.selectedModel, 'Write code file to workspace', code, 'agent_code', { input: 150, output: code.length / 3.8, costUSD: 0.0022 });
    } catch (err: any) {
      vscode.window.showErrorMessage(`AI360 Error writing file: ${err.message}`);
    }
  }

  private async _handleLoginEmployee(email: string, pass: string): Promise<void> {
    this._postMessage({ type: 'setAuthLoading', loading: true });
    try {
      const result = await this.authManager.loginEmployee(email, pass);
      vscode.window.showInformationMessage(`AI360: Authenticated as ${result.profile.displayName} (${result.profile.role}).`);
      await this._updateWebviewState();
      this._postMessage({ type: 'setActiveTab', tab: 'chat' });
    } catch (err: any) {
      vscode.window.showErrorMessage(`AI360 Auth Error: ${err.message}`);
      this._postMessage({ type: 'loginError', message: err.message });
    } finally {
      this._postMessage({ type: 'setAuthLoading', loading: false });
    }
  }

  private async _handleAddFileContext(): Promise<void> {
    const files = await vscode.workspace.findFiles('**/*.{ts,js,jsx,tsx,py,html,css,json,md}', '**/node_modules/**', 25);
    if (!files || files.length === 0) {
      vscode.window.showInformationMessage('No supported code files found in workspace.');
      return;
    }

    const items = files.map(f => ({
      label: vscode.workspace.asRelativePath(f),
      description: path.basename(f.fsPath),
      uri: f
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select workspace file to attach to AI360 Context'
    });

    if (selected) {
      try {
        const doc = await vscode.workspace.openTextDocument(selected.uri);
        const content = doc.getText();
        const snippet = `### Attached Context: \`${selected.label}\`\n\`\`\`${path.extname(selected.label).slice(1) || 'text'}\n${content.slice(0, 3500)}${content.length > 3500 ? '\n...[truncated]' : ''}\n\`\`\`\n\n`;
        this._postMessage({ type: 'appendInputText', text: snippet });
        vscode.window.showInformationMessage(`Attached ${selected.label} to context.`);
      } catch (e: any) {
        vscode.window.showErrorMessage(`Error reading file: ${e.message}`);
      }
    }
  }

  private async _handleRecommendationAction(command?: string): Promise<void> {
    if (!command) return;
    if (command === 'switch_model_gemini_flash') {
      this.selectedModel = 'gemini-3.5-flash';
      this._postMessage({ type: 'updateModel', model: this.selectedModel });
      vscode.window.showInformationMessage('AI360: Switched model to Gemini 1.5 Flash.');
    } else {
      vscode.window.showInformationMessage(`AI360 Action Applied: ${command}`);
    }
  }

  private renderMarkdownWithAgentTools(text: string): string {
    const regex = /```(\w+)?(?:\s+file="([^"]+)")?\n([\s\S]*?)```/g;
    let htmlProcessed = text.replace(regex, (_match, lang = 'code', filepath = '', code = '') => {
      const safeCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const encodedCode = encodeURIComponent(code.trim());
      const displayFile = filepath ? `${filepath}` : `${lang.toUpperCase()}`;

      return `
<div class="code-box">
  <div class="code-header">
    <span class="file-tag">${displayFile}</span>
    <div class="code-actions">
      <button onclick="applyCodeToWorkspace('${encodedCode}', '${filepath}')" class="btn btn-emerald btn-xs">Apply</button>
      ${filepath ? `<button onclick="writeFileToWorkspace('${encodedCode}', '${filepath}')" class="btn btn-primary btn-xs">Save</button>` : ''}
      <button onclick="copyCodeText('${encodedCode}')" class="btn btn-secondary btn-xs">Copy</button>
    </div>
  </div>
  <pre class="code-content"><code>${safeCode}</code></pre>
</div>`;
    });

    try {
      htmlProcessed = marked.parse(htmlProcessed) as string;
    } catch (e) {
      /* fallback */
    }
    return htmlProcessed;
  }

  private _postMessage(message: any): void {
    if (this._view && this._view.webview) {
      this._view.webview.postMessage(message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'resources', 'logo.png'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI360 Copilot</title>
  <style>
    :root {
      --bg-main: var(--vscode-editor-background, #121218);
      --bg-card: var(--vscode-sideBar-background, #181820);
      --text-main: var(--vscode-editor-foreground, #e6e6ee);
      --text-muted: var(--vscode-descriptionForeground, #888898);
      --accent: var(--vscode-focusBorder, #6c63ff);
      --accent-muted: rgba(108, 99, 255, 0.15);
      --border-color: var(--vscode-panel-border, rgba(255, 255, 255, 0.07));
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      color: var(--text-main);
      background-color: var(--bg-main);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-size: 11.5px;
      line-height: 1.4;
    }

    /* Header Nav with Right Action Icons */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      padding: 0 4px;
      height: 30px;
      flex-shrink: 0;
    }
    .nav-tabs {
      display: flex;
      gap: 1px;
      height: 100%;
    }
    .tab-btn {
      padding: 0 8px;
      height: 29px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      border-bottom: 2px solid transparent;
      transition: all 0.12s;
      white-space: nowrap;
    }
    .tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.02); }
    .tab-btn.active { color: var(--text-main); border-bottom-color: var(--accent); font-weight: 600; background: var(--accent-muted); }

    /* Top Right Action Icons */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .icon-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      transition: all 0.12s;
    }
    .icon-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.06); }
    .icon-btn.active { color: var(--accent); background: var(--accent-muted); }

    /* Telemetry Banner - Used & Tokens Left */
    .telemetry-bar {
      padding: 3.5px 8px;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .telemetry-val { color: var(--text-main); font-weight: 600; }

    /* Main Content Layout */
    .content-area { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .tab-pane { display: none; flex: 1; flex-direction: column; height: 100%; overflow-y: auto; }
    .tab-pane.active { display: flex; }

    /* Chat Messages */
    .chat-messages { flex: 1; overflow-y: auto; padding: 6px 8px; display: flex; flex-direction: column; gap: 6px; }
    .msg-wrapper { display: flex; gap: 6px; max-width: 100%; }
    .msg-wrapper.user { flex-direction: row-reverse; }
    .msg-avatar { width: 18px; height: 18px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 9.5px; font-weight: 700; flex-shrink: 0; }
    .msg-avatar.ai { background: rgba(108, 99, 255, 0.25); color: #d5d2ff; }
    .msg-avatar.user { background: rgba(255, 255, 255, 0.12); color: var(--text-main); }
    .msg-bubble { max-width: calc(100% - 24px); padding: 5px 8px; border-radius: 4px; font-size: 11.5px; line-height: 1.4; word-break: break-word; }
    .msg-wrapper.user .msg-bubble { background: var(--accent); color: white; border-radius: 4px 2px 4px 4px; }
    .msg-wrapper.assistant .msg-bubble { background: rgba(255,255,255,0.025); border: 1px solid var(--border-color); border-radius: 2px 4px 4px 4px; }

    /* Auto-Optimized Prompt Box Above Input */
    .optimized-box {
      background: rgba(0, 212, 170, 0.06);
      border: 1px solid rgba(0, 212, 170, 0.25);
      border-radius: 4px;
      padding: 6px 8px;
      margin: 0 6px 4px 6px;
      font-size: 10.5px;
    }
    .optimized-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #00D4AA;
      margin-bottom: 3px;
    }
    .mask-tag {
      font-size: 9.5px;
      padding: 1px 4px;
      background: rgba(255, 107, 107, 0.15);
      color: #FF6B6B;
      border-radius: 2px;
      font-weight: 600;
    }

    /* Minimal Code Block Layout */
    .code-box { margin: 4px 0; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color); background: rgba(0,0,0,0.3); }
    .code-header { padding: 3px 6px; background: rgba(0,0,0,0.25); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .file-tag { font-size: 10.5px; font-family: monospace; font-weight: 600; color: var(--text-muted); }
    .code-actions { display: flex; gap: 3px; }
    .code-content { padding: 6px 8px; overflow-x: auto; font-size: 11px; font-family: var(--vscode-editor-font-family, monospace); line-height: 1.4; color: #f0f0f5; margin: 0; }

    /* Minimal Input Controls & Refined Action Pills */
    .chat-input-box { padding: 6px; border-top: 1px solid var(--border-color); background: var(--bg-card); display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
    .model-selector { padding: 3px 5px; border-radius: 3px; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main); font-size: 10.5px; font-weight: 500; cursor: pointer; width: 100%; outline: none; }
    .textarea-wrapper { display: flex; flex-direction: column; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(0,0,0,0.15); overflow: hidden; }
    .textarea-wrapper:focus-within { border-color: var(--accent); }
    textarea { width: 100%; border: none; background: transparent; color: var(--text-main); padding: 5px 7px; resize: none; min-height: 38px; font-family: inherit; font-size: 11.5px; outline: none; line-height: 1.35; }
    .input-actions { display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; background: rgba(0,0,0,0.18); border-top: 1px solid var(--border-color); }
    
    /* Beautiful Sleek Action Pills */
    .action-pill {
      padding: 2px 7px;
      border-radius: 3px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
      color: var(--text-muted);
      font-size: 10.5px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.12s ease;
      height: 22px;
    }
    .action-pill:hover {
      color: var(--text-main);
      background: rgba(108, 99, 255, 0.12);
      border-color: rgba(108, 99, 255, 0.3);
    }
    .action-pill.danger:hover {
      color: #FF6B6B;
      background: rgba(255, 107, 107, 0.12);
      border-color: rgba(255, 107, 107, 0.3);
    }

    .btn { padding: 3px 8px; border-radius: 3px; border: 1px solid var(--border-color); font-size: 10.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.1s; height: 22px; text-decoration: none; background: rgba(255,255,255,0.04); color: var(--text-main); }
    .btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
    .btn-xs { padding: 1px 6px; font-size: 10px; height: 20px; border-radius: 3px; }
    .btn-primary { background: var(--accent); color: white; border-color: transparent; font-weight: 600; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary { background: transparent; color: var(--text-muted); border-color: var(--border-color); }
    .btn-secondary:hover { color: var(--text-main); background: rgba(255,255,255,0.04); }
    .btn-emerald { background: rgba(0, 212, 170, 0.1); color: #00D4AA; border-color: rgba(0, 212, 170, 0.25); }

    /* Flat Minimal Cards */
    .card { background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; margin-bottom: 6px; }
    .section-title { font-size: 11.5px; font-weight: 600; margin-bottom: 6px; color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; }
    .form-group { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
    label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    input[type="text"], input[type="password"] { padding: 5px 7px; border-radius: 3px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); font-size: 11px; outline: none; }
    input:focus { border-color: var(--accent); }

    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 2px; }
  </style>
</head>
<body>
  <!-- Header Navigation Bar -->
  <div class="header-bar">
    <div style="display: flex; align-items: center; gap: 6px;">
      <img src="${logoUri}" style="height: 18px; width: 18px; border-radius: 4px; object-fit: cover; margin-left: 2px;" alt="AI360" />
      <div class="nav-tabs">
        <button class="tab-btn active" onclick="switchTab('chat')" id="btn-chat">Chat</button>
        <button class="tab-btn" onclick="switchTab('usage')" id="btn-usage">Usage</button>
        <button class="tab-btn" onclick="switchTab('recommendations')" id="btn-recommendations">Tips</button>
      </div>
    </div>
    <div class="header-actions">
      <button class="icon-btn" onclick="switchTab('history')" id="btn-history" title="Prompt History">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C4.1 1 1 4.1 1 8C1 11.9 4.1 15 8 15C11.9 15 15 11.9 15 8C15 4.1 11.9 1 8 1ZM8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C11 2.5 13.5 5 13.5 8C13.5 11 11 13.5 8 13.5ZM8.5 4.5H7V9L10.8 11.3L11.5 10.1L8.5 8.3V4.5Z"/></svg>
      </button>
      <button class="icon-btn" onclick="switchTab('settings')" id="btn-settings" title="Settings & Auth">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M9.1 1L8.7 2.3C8.3 2.5 7.9 2.7 7.5 3L6.2 2.3L4.8 3.7L5.5 5C5.2 5.4 5 5.8 4.8 6.2L3.5 6.6V8.6L4.8 9C5 9.4 5.2 9.8 5.5 10.2L4.8 11.5L6.2 12.9L7.5 12.2C7.9 12.5 8.3 12.7 8.7 12.9L9.1 14.2H11.1L11.5 12.9C11.9 12.7 12.3 12.5 12.7 12.2L14 12.9L15.4 11.5L14.7 10.2C15 9.8 15.2 9.4 15.4 9L16.7 8.6V6.6L15.4 6.2C15.2 5.8 15 5.4 14.7 5L15.4 3.7L14 2.3L12.7 3C12.3 2.7 11.9 2.5 11.5 2.3L11.1 1H9.1ZM10.1 6.1C11.2 6.1 12.1 7 12.1 8.1C12.1 9.2 11.2 10.1 10.1 10.1C9 10.1 8.1 9.2 8.1 8.1C8.1 7 9 6.1 10.1 6.1Z"/></svg>
      </button>
    </div>
  </div>

  <!-- Telemetry Banner - Used & Tokens Left -->
  <div class="telemetry-bar" id="telemetry-bar">
    <span>Used: <span class="telemetry-val" id="ticker-tokens">0</span></span>
    <span>Tokens Left: <span class="telemetry-val" id="ticker-left" style="color: #00D4AA">250,000</span></span>
    <span>Calls: <span class="telemetry-val" id="ticker-req">0</span></span>
  </div>

  <div class="content-area">
    <!-- TAB 1: AGENT CHAT & CODING -->
    <div class="tab-pane active" id="pane-chat">
      <div class="chat-messages" id="chat-messages">
        <div class="card" id="welcome-card" style="margin-top: 8px; text-align: center; padding: 12px 8px;">
          <h3 style="font-size: 12px; font-weight: 600; margin-bottom: 3px; color: var(--text-main);">AI360 Copilot</h3>
          <p style="font-size: 11px; color: var(--text-muted); max-width: 260px; margin: 0 auto 10px; line-height: 1.35;">
            Workspace code editing with automatic sensitive data masking & live prompt optimization.
          </p>
          <div style="display: flex; gap: 4px; justify-content: center;">
            <button class="btn btn-secondary btn-xs" onclick="sendQuickPrompt('Analyze my active file architecture and suggest refactoring.')">Analyze File</button>
            <button class="btn btn-secondary btn-xs" onclick="sendQuickPrompt('Create a reusable helper utility in TypeScript with unit tests.')">Build Utility</button>
          </div>
        </div>
      </div>

      <!-- Live Auto-Optimized Prompt & Security Preview Box Above Input -->
      <div id="optimized-preview-container" class="optimized-box" style="display: none;">
        <div class="optimized-header">
          <span>Auto-Optimized Prompt</span>
          <span id="masked-badge" class="mask-tag" style="display: none;">Data Sanitized</span>
        </div>
        <div id="optimized-text-content" style="color: var(--text-main); font-family: monospace; font-size: 10px; white-space: pre-wrap; margin-bottom: 4px; max-height: 70px; overflow-y: auto;"></div>
      </div>

      <div class="chat-input-box">
        <div class="textarea-wrapper">
          <textarea id="prompt-input" placeholder="Ask AI360 to read, refactor, or edit code... (Enter to send)" oninput="onInputTyping()"></textarea>
          <div class="input-actions">
            <div style="display: flex; gap: 4px;">
              <button class="action-pill" onclick="addFileContext()" title="Attach workspace file context">+ Attach File</button>
              <button class="action-pill danger" onclick="clearHistory()" title="Clear chat session">Clear</button>
            </div>
            <div style="display: flex; gap: 4px; align-items: center;">
              <select class="model-selector" id="model-select" onchange="onModelChanged()" style="width: auto; height: 22px; max-width: 130px; font-size: 10px; padding: 2px 4px;">
                ${SUPPORTED_MODELS.map(m => `<option value="${m.id}">${m.label}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-xs" id="send-btn" onclick="sendMessage()">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: PROMPT HISTORY -->
    <div class="tab-pane" id="pane-history" style="padding: 8px;">
      <div class="section-title">Prompt History</div>
      <p style="font-size: 10.5px; color: var(--text-muted); margin-bottom: 6px;">
        View past prompts and reuse previous session instructions.
      </p>
      <div id="history-prompt-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
    </div>

    <!-- TAB 3: AI USAGE & FINOPS TELEMETRY -->
    <div class="tab-pane" id="pane-usage" style="padding: 8px;">
      <div class="section-title">Today's AI FinOps Metrics</div>
      <div class="card" style="padding: 8px;">
        <div style="font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Total Tokens Left</div>
        <div style="font-size: 18px; font-weight: 700; color: #00D4AA; margin: 2px 0 4px;" id="stats-total-left">250,000</div>
        <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-muted);">
          <span>Used: <b id="stats-total-tokens" style="color: var(--text-main)">0</b></span>
          <span>Requests: <b id="stats-total-req" style="color: var(--text-main)">0</b></span>
        </div>
      </div>
      <div style="font-size: 10.5px; font-weight: 600; margin: 6px 0 4px; color: var(--text-muted); text-transform: uppercase;">Usage By AI Model</div>
      <div id="model-breakdown-container"></div>
      <div style="font-size: 10.5px; font-weight: 600; margin: 8px 0 4px; color: var(--text-muted); text-transform: uppercase;">Recent Telemetry Feed</div>
      <div id="recent-activity-list" style="display: flex; flex-direction: column; gap: 3px;"></div>
    </div>

    <!-- TAB 4: RECOMMENDATIONS & TIPS -->
    <div class="tab-pane" id="pane-recommendations" style="padding: 8px;">
      <div class="section-title">AI & FinOps Optimization Tips</div>
      <div id="recommendations-list"></div>
    </div>

    <!-- TAB 5: SETTINGS & AUTHENTICATION -->
    <div class="tab-pane" id="pane-settings" style="padding: 8px;">
      <div class="section-title">Settings & Employee Authentication</div>
      
      <div class="card" style="padding: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; font-weight: 600; color: var(--text-main);">AI360 Web Dashboard</div>
          <div style="font-size: 10px; color: var(--text-muted);">Connect or sign in via browser</div>
        </div>
        <button class="btn btn-emerald btn-xs" onclick="connectWebDashboard()">Open in Browser</button>
      </div>

      <div id="auth-unauthenticated" style="display: none; flex-direction: column; align-items: center; justify-content: center; padding: 6px 0;">
        <div class="card" style="width: 100%; padding: 10px;">
          <div style="font-size: 11px; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Direct Extension Login</div>
          <div class="form-group">
            <label>EMPLOYEE EMAIL</label>
            <input type="text" id="login-email" value="employee@ai360.io" placeholder="employee@ai360.io">
          </div>
          <div class="form-group" style="margin-bottom: 10px;">
            <label>PASSWORD / TOKEN</label>
            <input type="password" id="login-password" value="Password123" placeholder="Password123">
          </div>
          <button class="btn btn-primary" style="width: 100%; height: 24px;" onclick="submitLogin()">
            Authenticate Session
          </button>
        </div>
      </div>

      <div id="auth-authenticated" style="display: none;">
        <div class="card" style="padding: 10px; text-align: center;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;" id="profile-avatar">M</div>
          <h3 style="font-size: 12px; font-weight: 600; margin-bottom: 1px;" id="profile-name">Employee Name</h3>
          <span style="font-size: 9.5px; padding: 1px 5px; border-radius: 2px; background: rgba(0, 212, 170, 0.12); color: #00D4AA; font-weight: 600; display: inline-block; margin-top: 2px;" id="profile-role">EMPLOYEE</span>
          <p style="font-size: 10.5px; color: var(--text-muted); margin: 4px 0 8px;" id="profile-email">employee@ai360.io</p>
          <div style="padding-top: 6px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; font-size: 10.5px;">
            <span>Org: <b>AI360 HQ</b></span>
            <span>Tokens Left: <b style="color: #00D4AA;" id="profile-tokens-left">235,180</b></span>
          </div>
        </div>
        <button class="btn btn-secondary" style="width: 100%; color: #FF6B6B; border-color: rgba(255, 107, 107, 0.2); margin-top: 4px;" onclick="logoutEmployee()">
          Sign Out Session
        </button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentTab = 'chat';
    let isAuthenticated = false;
    let typingTimer = null;

    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (msg.type === 'stateUpdate') {
        isAuthenticated = msg.isAuthenticated;
        updateAuthDisplay(msg.profile);
        updateStatsDisplay(msg.stats);
        updateRecommendationsDisplay(msg.recommendations);
        if (msg.promptHistory) updateHistoryDisplay(msg.promptHistory);
        if (msg.selectedModel) document.getElementById('model-select').value = msg.selectedModel;
      }
      if (msg.type === 'updateStats') updateStatsDisplay(msg.stats);
      if (msg.type === 'updateHistory') updateHistoryDisplay(msg.promptHistory);
      if (msg.type === 'setActiveTab') switchTab(msg.tab);
      if (msg.type === 'addMessage') addMessageToChat(msg.message, msg.optimizedContent);
      if (msg.type === 'setLoading') setChatLoading(msg.loading);
      if (msg.type === 'setInputValue') {
        document.getElementById('prompt-input').value = msg.text;
        onInputTyping();
      }
      if (msg.type === 'appendInputText') {
        const inp = document.getElementById('prompt-input');
        inp.value = msg.text + '\\n' + inp.value;
        onInputTyping();
      }
      if (msg.type === 'showOptimizationPreview') {
        renderOptimizationPreview(msg);
      }
      if (msg.type === 'clearOptimizationPreview') {
        document.getElementById('optimized-preview-container').style.display = 'none';
      }
      if (msg.type === 'clearMessages') {
        document.getElementById('chat-messages').innerHTML = '<div style="text-align:center; padding: 10px; color: var(--text-muted); font-size: 10.5px;">Session cleared. Ready for instructions.</div>';
      }
    });

    vscode.postMessage({ type: 'requestInitialState' });

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      if (tab === 'history') {
        document.getElementById('btn-history')?.classList.add('active');
      } else if (tab === 'settings') {
        document.getElementById('btn-settings')?.classList.add('active');
      } else {
        document.getElementById('btn-' + tab)?.classList.add('active');
      }
      document.getElementById('pane-' + tab)?.classList.add('active');
    }

    function onInputTyping() {
      clearTimeout(typingTimer);
      const text = document.getElementById('prompt-input').value.trim();
      if (!text) {
        document.getElementById('optimized-preview-container').style.display = 'none';
        return;
      }
      typingTimer = setTimeout(() => {
        vscode.postMessage({ type: 'previewOptimization', content: text });
      }, 350);
    }

    function renderOptimizationPreview(msg) {
      const container = document.getElementById('optimized-preview-container');
      const textElem = document.getElementById('optimized-text-content');
      const badge = document.getElementById('masked-badge');

      if (msg.maskedCount > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = msg.maskedCount + ' sensitive item(s) masked';
      } else {
        badge.style.display = 'none';
      }

      textElem.textContent = msg.optimizedPrompt;
      container.style.display = 'block';
    }

    function updateAuthDisplay(profile) {
      if (profile && isAuthenticated) {
        document.getElementById('auth-unauthenticated').style.display = 'none';
        document.getElementById('auth-authenticated').style.display = 'block';
        document.getElementById('profile-name').textContent = profile.displayName || profile.email;
        document.getElementById('profile-email').textContent = profile.email;
        document.getElementById('profile-role').textContent = (profile.role || 'EMPLOYEE').toUpperCase();
        document.getElementById('profile-avatar').textContent = (profile.displayName || 'M')[0].toUpperCase();
      } else {
        document.getElementById('auth-unauthenticated').style.display = 'flex';
        document.getElementById('auth-authenticated').style.display = 'none';
      }
    }

    function updateStatsDisplay(stats) {
      if (!stats) return;
      var totalUsed = stats.totalTokens || 0;
      var totalBudget = 250000;
      var tokensLeft = Math.max(0, totalBudget - totalUsed);

      document.getElementById('ticker-tokens').textContent = totalUsed.toLocaleString();
      document.getElementById('ticker-left').textContent = tokensLeft.toLocaleString();
      document.getElementById('ticker-req').textContent = stats.requests || 0;

      const totalLeftElem = document.getElementById('stats-total-left');
      if (totalLeftElem) totalLeftElem.textContent = tokensLeft.toLocaleString();
      
      const statsUsedElem = document.getElementById('stats-total-tokens');
      if (statsUsedElem) statsUsedElem.textContent = totalUsed.toLocaleString();

      const profileLeftElem = document.getElementById('profile-tokens-left');
      if (profileLeftElem) profileLeftElem.textContent = tokensLeft.toLocaleString();

      const modelCont = document.getElementById('model-breakdown-container');
      if (modelCont && stats.byModel) {
        modelCont.innerHTML = Object.entries(stats.byModel).map(([model, data]) => \`
          <div class="card" style="padding: 6px; margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 10.5px; color: var(--text-main);">\${model}</div>
              <div style="font-size: 9.5px; color: var(--text-muted);">\${data.requests} calls | \${data.tokens.toLocaleString()} tokens</div>
            </div>
            <div style="font-weight: 600; color: #00D4AA; font-size: 11px;">$\${data.costUSD.toFixed(4)}</div>
          </div>
        \`).join('');
      }

      const actCont = document.getElementById('recent-activity-list');
      if (actCont && stats.records) {
        actCont.innerHTML = stats.records.slice(0, 8).map(r => \`
          <div style="padding: 5px 6px; border-radius: 3px; background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 10px;">
            <div>
              <span style="color: var(--text-main); font-weight: 600;">[\${r.requestType.toUpperCase()}]</span>
              <span style="color: var(--text-muted); margin-left: 3px;">\${r.model.split('-')[0]}</span>
              <div style="color: var(--text-muted); font-size: 9px;">\${r.timestamp} • \${r.totalTokens} tokens</div>
            </div>
            <div style="font-weight: 600; color: #00D4AA;">$\${r.costUSD.toFixed(4)}</div>
          </div>
        \`).join('');
      }
    }

    function updateHistoryDisplay(history) {
      const cont = document.getElementById('history-prompt-list');
      if (!cont || !history) return;
      if (history.length === 0) {
        cont.innerHTML = '<div style="font-size: 10.5px; color: var(--text-muted); text-align: center; padding: 12px;">No prompt history yet.</div>';
        return;
      }
      cont.innerHTML = history.map(item => \`
        <div class="card" style="padding: 6px 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: var(--text-muted); margin-bottom: 3px;">
            <span>\${item.timestamp} • \${item.model.split('-')[0]}</span>
            <button class="btn btn-secondary btn-xs" onclick="reusePrompt('\${encodeURIComponent(item.prompt)}')">Reuse</button>
          </div>
          <p style="font-size: 11px; color: var(--text-main); white-space: pre-wrap; line-height: 1.35;">\${item.prompt}</p>
        </div>
      \`).join('');
    }

    function reusePrompt(encoded) {
      const prompt = decodeURIComponent(encoded);
      switchTab('chat');
      document.getElementById('prompt-input').value = prompt;
      onInputTyping();
    }

    function updateRecommendationsDisplay(recs) {
      const cont = document.getElementById('recommendations-list');
      if (!cont || !recs) return;
      cont.innerHTML = recs.map(r => \`
        <div class="card" style="padding: 6px 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px;">
            <span style="font-weight: 600; font-size: 11px; color: var(--text-main);">\${r.title}</span>
            <span style="font-size: 9.5px; padding: 1px 4px; border-radius: 2px; background: rgba(0,212,170,0.12); color: #00D4AA; font-weight: 600; white-space: nowrap;">\${r.impact}</span>
          </div>
          <p style="font-size: 10.5px; color: var(--text-muted); line-height: 1.35; margin-bottom: 6px;">\${r.description}</p>
          <button class="btn btn-secondary btn-xs" onclick="applyRec('\${r.actionCommand}')">\${r.actionText}</button>
        </div>
      \`).join('');
    }

    function sendMessage() {
      const inp = document.getElementById('prompt-input');
      const content = inp.value.trim();
      if (!content) return;
      document.getElementById('optimized-preview-container').style.display = 'none';
      vscode.postMessage({ type: 'sendMessage', content });
      inp.value = '';
    }

    function sendQuickPrompt(text) {
      vscode.postMessage({ type: 'sendMessage', content: text });
    }

    function onModelChanged() {
      const model = document.getElementById('model-select').value;
      vscode.postMessage({ type: 'changeModel', model });
    }

    function addFileContext() {
      vscode.postMessage({ type: 'addFileContext' });
    }

    function clearHistory() {
      vscode.postMessage({ type: 'clearHistory' });
    }

    function submitLogin() {
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      vscode.postMessage({ type: 'loginEmployee', email, password: pass });
    }

    function connectWebDashboard() {
      vscode.postMessage({ type: 'openWebDashboard' });
    }

    function logoutEmployee() {
      vscode.postMessage({ type: 'logout' });
    }

    function applyRec(command) {
      vscode.postMessage({ type: 'applyRecommendationAction', command });
    }

    function applyCodeToWorkspace(encodedCode, filepath) {
      const code = decodeURIComponent(encodedCode);
      vscode.postMessage({ type: 'applyCode', code, filepath });
    }

    function writeFileToWorkspace(encodedCode, filepath) {
      const code = decodeURIComponent(encodedCode);
      vscode.postMessage({ type: 'writeFile', code, filepath });
    }

    function copyCodeText(encodedCode) {
      const code = decodeURIComponent(encodedCode);
      navigator.clipboard.writeText(code);
      alert('Code copied to clipboard.');
    }

    function addMessageToChat(msg, optimizedContent) {
      const welcome = document.getElementById('welcome-card');
      if (welcome) welcome.style.display = 'none';

      const div = document.createElement('div');
      div.className = 'msg-wrapper ' + msg.role;
      
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar ' + (msg.role === 'user' ? 'user' : 'ai');
      avatar.textContent = msg.role === 'user' ? 'U' : 'AI';

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';

      let inner = msg.htmlContent || msg.content;
      if (msg.meta && msg.meta.maskedCount > 0) {
        var mTypes = (msg.meta.maskedTypes || []).join(', ');
        inner = '<div style="font-size: 9.5px; color: #FF6B6B; font-weight: 600; margin-bottom: 2px;">Sanitized ' + msg.meta.maskedCount + ' item(s) (' + mTypes + ')</div>' + inner;
      }
      if (optimizedContent && msg.role === 'user') {
        inner += '<div style="margin-top: 4px; padding: 4px; background: rgba(0,212,170,0.08); border-radius: 3px; font-size: 10px; color: #00D4AA;">Optimized: ' + optimizedContent.slice(0, 100) + '...</div>';
      }
      
      if (msg.role === 'user' && msg.meta && msg.meta.score) {
          inner += '<div style="margin-top: 4px; font-size: 9.5px; color: var(--text-muted);">Prompt Score: <strong style="color: #00D4AA;">' + (msg.meta.score / 10).toFixed(1) + '/10</strong></div>';
      }
      
      if (msg.role === 'assistant' && msg.meta && msg.meta.inputTokens !== undefined) {
          inner += '<div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 9px; color: var(--text-muted); display: flex; gap: 8px;">' +
                   '<span>Input Tokens: <strong style="color: #9cdcfe;">' + msg.meta.inputTokens + '</strong></span>' +
                   '<span>Output Tokens: <strong style="color: #ce9178;">' + msg.meta.outputTokens + '</strong></span>' +
                   '<span>Total: <strong>' + msg.meta.tokens + '</strong></span>' +
                   '</div>';
      }
      
      bubble.innerHTML = inner;

      div.appendChild(avatar);
      div.appendChild(bubble);
      
      const cont = document.getElementById('chat-messages');
      cont.appendChild(div);
      cont.scrollTop = cont.scrollHeight;
    }

    let loadingElem = null;
    function setChatLoading(loading) {
      const cont = document.getElementById('chat-messages');
      if (loading) {
        loadingElem = document.createElement('div');
        loadingElem.className = 'msg-wrapper assistant';
        loadingElem.innerHTML = '<div class="msg-avatar ai">AI</div><div class="msg-bubble" style="color: var(--text-muted); font-style: italic;">Processing code...</div>';
        cont.appendChild(loadingElem);
        cont.scrollTop = cont.scrollHeight;
      } else if (loadingElem) {
        loadingElem.remove();
        loadingElem = null;
      }
    }
  </script>
</body>
</html>`;
  }
}
