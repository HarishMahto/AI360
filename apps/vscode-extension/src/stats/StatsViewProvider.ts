// AI360 VS Code Extension – Stats View Provider
import * as vscode from 'vscode';
import { ApiClient } from '../api/ApiClient';

export class StatsViewProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly apiClient: ApiClient,
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'refresh') {
        try {
          const stats = await this.apiClient.getTodayStats();
          webviewView.webview.postMessage({ type: 'stats', stats });
        } catch {
          webviewView.webview.postMessage({ type: 'error' });
        }
      }
    });
  }

  private _getHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI360 Stats</title>
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); padding: 12px; font-size: 12.5px; }
  .stat { padding: 10px; border-radius: 8px; background: var(--vscode-input-background); border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06)); margin-bottom: 8px; }
  .stat-label { font-size: 11px; color: var(--vscode-descriptionForeground); }
  .stat-value { font-size: 20px; font-weight: 800; margin-top: 2px; }
  .cost { color: #00D4AA; }
  .tokens { color: #6C63FF; }
  .requests { color: #FFB547; }
  button { width: 100%; padding: 7px; border: none; border-radius: 6px; background: rgba(108,99,255,0.15); color: #6C63FF; border: 1px solid rgba(108,99,255,0.3); cursor: pointer; font-size: 12px; font-weight: 600; margin-top: 4px; }
  button:hover { background: rgba(108,99,255,0.25); }
</style>
</head>
<body>
<div style="font-weight:700;margin-bottom:10px;font-size:13px">📊 Today's Stats</div>
<div class="stat"><div class="stat-label">Cost</div><div class="stat-value cost" id="cost">$0.00</div></div>
<div class="stat"><div class="stat-label">Tokens Used</div><div class="stat-value tokens" id="tokens">0</div></div>
<div class="stat"><div class="stat-label">Requests</div><div class="stat-value requests" id="requests">0</div></div>
<button id="refresh">↻ Refresh</button>
<script>
  const vscode = acquireVsCodeApi();
  document.getElementById('refresh').addEventListener('click', () => vscode.postMessage({ type: 'refresh' }));
  window.addEventListener('message', (e) => {
    if (e.data.type === 'stats') {
      const s = e.data.stats;
      document.getElementById('cost').textContent = '$' + (s.costUSD ?? 0).toFixed(4);
      document.getElementById('tokens').textContent = (s.totalTokens ?? 0).toLocaleString();
      document.getElementById('requests').textContent = s.requests ?? 0;
    }
  });
  vscode.postMessage({ type: 'refresh' });
</script>
</body>
</html>`;
  }
}
