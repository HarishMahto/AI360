// AI360 VS Code Extension – Prompt View Provider
// Prompt scoring, optimization, and rewriting panel
import * as vscode from 'vscode';
import { ApiClient } from '../api/ApiClient';

export class PromptViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly apiClient: ApiClient,
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case 'score':
          await this._handleScore(msg.prompt);
          break;
        case 'optimize':
          await this._handleOptimize(msg.prompt);
          break;
      }
    });
  }

  async optimizeText(text: string) {
    this._view?.webview.postMessage({ type: 'setPrompt', prompt: text });
    await this._handleOptimize(text);
  }

  async scoreText(text: string) {
    this._view?.webview.postMessage({ type: 'setPrompt', prompt: text });
    await this._handleScore(text);
  }

  private async _handleScore(prompt: string) {
    this._post({ type: 'loading', loading: true });
    try {
      const res = await this.apiClient.scorePrompt(prompt);
      this._post({ type: 'scoreResult', result: res.data.data });
    } catch (err: any) {
      this._post({ type: 'error', message: err.message });
    } finally {
      this._post({ type: 'loading', loading: false });
    }
  }

  private async _handleOptimize(prompt: string) {
    this._post({ type: 'loading', loading: true });
    try {
      const res = await this.apiClient.optimizePrompt(prompt);
      this._post({ type: 'optimizeResult', result: res.data.data });
    } catch (err: any) {
      this._post({ type: 'error', message: err.message });
    } finally {
      this._post({ type: 'loading', loading: false });
    }
  }

  private _post(msg: object) {
    this._view?.webview.postMessage(msg);
  }

  private _getHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI360 Prompt Studio</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); padding: 12px; font-size: 12.5px; }
  h3 { font-size: 13px; margin-bottom: 10px; }
  textarea { width: 100%; background: var(--vscode-input-background); border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08)); color: var(--vscode-editor-foreground); padding: 8px; border-radius: 6px; font-size: 12px; font-family: inherit; resize: vertical; min-height: 80px; }
  textarea:focus { outline: 1px solid #6C63FF; border-color: #6C63FF; }
  .btn-row { display: flex; gap: 6px; margin-top: 8px; }
  button { flex: 1; padding: 7px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: opacity 0.2s; }
  .btn-score { background: rgba(108,99,255,0.15); color: #6C63FF; border: 1px solid rgba(108,99,255,0.3); }
  .btn-optimize { background: linear-gradient(135deg, #6C63FF, #8B85FF); color: white; }
  button:hover { opacity: 0.85; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .section { margin-top: 14px; padding: 10px; background: var(--vscode-input-background); border-radius: 8px; border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06)); }
  .section-title { font-weight: 700; font-size: 12px; margin-bottom: 8px; }
  .score-overall { font-size: 28px; font-weight: 800; }
  .criteria { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
  .criterion { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 11px; }
  .bar { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
  .optimized-text { font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; color: #00D4AA; }
  .suggestion { padding: 6px 8px; background: rgba(108,99,255,0.08); border-left: 2px solid #6C63FF; border-radius: 0 4px 4px 0; margin-top: 5px; font-size: 11px; }
  .error { color: #FF6B6B; font-size: 12px; margin-top: 8px; }
  .loading { text-align: center; color: var(--vscode-descriptionForeground); padding: 8px; font-size: 12px; }
</style>
</head>
<body>
<h3>✦ Prompt Studio</h3>
<textarea id="prompt-input" placeholder="Paste your prompt here to score or optimize it…"></textarea>
<div class="btn-row">
  <button class="btn-score" id="btn-score">Score</button>
  <button class="btn-optimize" id="btn-optimize">⚡ Optimize</button>
</div>
<div id="results"></div>

<script>
  const vscode = acquireVsCodeApi();
  const input = document.getElementById('prompt-input');
  const results = document.getElementById('results');

  document.getElementById('btn-score').addEventListener('click', () => {
    const p = input.value.trim();
    if (p) vscode.postMessage({ type: 'score', prompt: p });
  });
  document.getElementById('btn-optimize').addEventListener('click', () => {
    const p = input.value.trim();
    if (p) vscode.postMessage({ type: 'optimize', prompt: p });
  });

  function scoreColor(v) { return v >= 80 ? '#00D4AA' : v >= 60 ? '#FFB547' : '#FF6B6B'; }

  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.type === 'setPrompt') { input.value = msg.prompt; }
    if (msg.type === 'loading') { results.innerHTML = msg.loading ? '<div class="loading">Analyzing…</div>' : ''; }
    if (msg.type === 'error') { results.innerHTML = '<div class="error">Error: ' + msg.message + '</div>'; }
    if (msg.type === 'scoreResult') {
      const r = msg.result;
      const criteria = [
        ['Clarity', r.clarity], ['Context', r.context], ['Specificity', r.specificity],
        ['Structure', r.structure], ['Constraints', r.constraints], ['Output Format', r.outputFormat]
      ];
      results.innerHTML = \`
        <div class="section">
          <div class="section-title">Score</div>
          <div class="score-overall" style="color: \${scoreColor(r.overall)}">\${r.overall}</div>
          <div class="criteria">
            \${criteria.map(([label, val]) => \`
              <div class="criterion">
                <span style="min-width:90px">\${label}</span>
                <div class="bar"><div class="bar-fill" style="width:\${val}%;background:\${scoreColor(val)}"></div></div>
                <span style="min-width:26px;text-align:right;\${scoreColor(val) ? 'color:' + scoreColor(val) : ''}">\${val}</span>
              </div>
            \`).join('')}
          </div>
          \${r.suggestions?.length ? '<div style="margin-top:8px"><div class="section-title">Suggestions</div>' + r.suggestions.map(s => \`<div class="suggestion">\${s}</div>\`).join('') + '</div>' : ''}
        </div>
      \`;
    }
    if (msg.type === 'optimizeResult') {
      const r = msg.result;
      results.innerHTML = \`
        <div class="section">
          <div class="section-title">Optimized Prompt <span style="color:#00D4AA;font-size:11px">+\${r.estimatedImprovement}% better</span></div>
          <div class="optimized-text">\${r.optimizedPrompt}</div>
          \${r.sensitiveDataFindings?.length ? \`<div style="margin-top:8px;color:#FFB547;font-size:11px">⚠️ Sensitive data detected: \${r.sensitiveDataFindings.map(f => f.type).join(', ')}</div>\` : ''}
        </div>
      \`;
    }
  });
</script>
</body>
</html>`;
  }
}
