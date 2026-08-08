import * as vscode from 'vscode';
import axios from 'axios';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ai360.chatView';
  private _view?: vscode.WebviewView;
  private _token?: string;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          await this.handleSendMessage(data.value, data.model);
          break;
        case 'requestTokenStatus':
          webviewView.webview.postMessage({ type: 'tokenStatus', value: !!this._token });
          break;
      }
    });
  }

  public updateToken(token: string) {
    this._token = token;
    if (this._view) {
      this._view.webview.postMessage({ type: 'tokenStatus', value: true });
    }
  }

  private async handleSendMessage(message: string, model: string) {
    if (!this._view) { return; }
    if (!this._token) {
      vscode.window.showErrorMessage("AI360: Please login first using 'AI360: Login'");
      this._view.webview.postMessage({ type: 'error', value: 'Not logged in.' });
      return;
    }

    try {
      // In MVP, we are not parsing SSE streaming manually here for simplicity,
      // but in full implementation we'd use native fetch or event-source to stream.
      // For now, we will do a basic POST and wait.
      const response = await axios.post(
        'http://localhost:8000/chat',
        {
          messages: [{ role: 'user', content: message }],
          model: model,
          stream: false // Using non-streaming for MVP MVP to verify connection
        },
        {
          headers: {
            Authorization: `Bearer ${this._token}`,
          },
        }
      );

      this._view.webview.postMessage({ type: 'response', value: response.data.content });
    } catch (error: any) {
      vscode.window.showErrorMessage(`AI360 Error: ${error.message}`);
      this._view.webview.postMessage({ type: 'error', value: error.message });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI360 Chat</title>
  <style>
    :root {
      --glow-color: var(--vscode-focusBorder, #007fd4);
      --glass-bg: rgba(var(--vscode-editor-background), 0.7);
      --glass-border: rgba(255, 255, 255, 0.1);
    }
    body {
      font-family: var(--vscode-font-family), system-ui, sans-serif;
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      margin: 0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: 100vh;
      box-sizing: border-box;
      /* Futuristic subtle background gradient overlay */
      background: linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%), var(--vscode-editor-background);
    }
    
    /* Scrollbar Styling */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-hoverBackground); }
    ::-webkit-scrollbar-thumb:active { background: var(--vscode-scrollbarSlider-activeBackground); }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .logo {
      font-size: 1.2em;
      font-weight: 600;
      letter-spacing: 1px;
      background: -webkit-linear-gradient(45deg, var(--vscode-textLink-foreground), var(--glow-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #status {
      font-size: 0.75em;
      padding: 4px 10px;
      border-radius: 12px;
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border);
      display: inline-block;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    #chat-container {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-right: 4px;
    }

    .message {
      padding: 12px 16px;
      border-radius: 12px;
      max-width: 85%;
      word-wrap: break-word;
      line-height: 1.5;
      font-size: 0.95em;
      animation: slideIn 0.3s ease-out forwards;
      opacity: 0;
      transform: translateY(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    
    .message::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px; right: -1px; bottom: -1px;
      border-radius: 13px;
      z-index: -1;
    }

    @keyframes slideIn {
      to { opacity: 1; transform: translateY(0); }
    }

    .user {
      align-self: flex-end;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-bottom-right-radius: 4px;
    }

    .ai {
      align-self: flex-start;
      background: var(--vscode-editorWidget-background);
      color: var(--vscode-editorWidget-foreground);
      border: 1px solid var(--vscode-editorWidget-border);
      border-bottom-left-radius: 4px;
      border-left: 3px solid var(--glow-color);
    }
    
    .ai pre, .ai code {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: var(--vscode-editor-font-family), monospace;
      font-size: 0.9em;
    }
    .ai pre {
      padding: 10px;
      overflow-x: auto;
      margin: 8px 0;
      border: 1px solid rgba(255,255,255,0.05);
    }

    .input-wrapper {
      position: relative;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 8px;
      transition: border-color 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    
    .input-wrapper:focus-within {
      border-color: var(--vscode-focusBorder);
      box-shadow: 0 0 0 1px var(--vscode-focusBorder);
    }

    .input-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      background: rgba(0,0,0,0.1);
      border-radius: 8px 8px 0 0;
    }

    select {
      background: transparent;
      color: var(--vscode-dropdown-foreground);
      border: none;
      font-size: 0.85em;
      cursor: pointer;
      outline: none;
      font-family: inherit;
    }
    
    select option {
      background: var(--vscode-dropdown-background);
    }

    textarea {
      width: 100%;
      background: transparent;
      color: var(--vscode-input-foreground);
      border: none;
      padding: 12px;
      resize: none;
      min-height: 70px;
      font-family: var(--vscode-editor-font-family), monospace;
      font-size: 0.9em;
      box-sizing: border-box;
      outline: none;
    }
    
    textarea::placeholder {
      color: var(--vscode-inputPlaceholder-foreground);
      font-family: var(--vscode-font-family), system-ui, sans-serif;
    }

    .action-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 12px;
    }

    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85em;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
    }
    
    button:active {
      transform: translateY(1px);
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .typing-indicator {
      display: none;
      align-self: flex-start;
      padding: 12px 16px;
      background: transparent;
      gap: 4px;
    }
    .typing-indicator.active {
      display: flex;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: var(--vscode-descriptionForeground);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      AI360
    </div>
    <div id="status">Checking auth...</div>
  </div>
  
  <div id="chat-container"></div>
  
  <div class="typing-indicator" id="typing-indicator">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div>
  
  <div class="input-wrapper">
    <div class="input-controls">
      <select id="model-select">
        <option value="gpt-4o-mini">GPT-4o Mini</option>
        <option value="gemini-3.5-flash">Gemini 1.5 Flash</option>
        <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
      </select>
    </div>
    <textarea id="prompt-input" placeholder="Ask AI360... (Press Enter to send)"></textarea>
    <div class="action-row">
      <button id="send-button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        Send
      </button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    const statusEl = document.getElementById('status');
    const chatContainer = document.getElementById('chat-container');
    const inputEl = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-button');
    const modelSelect = document.getElementById('model-select');
    const typingIndicator = document.getElementById('typing-indicator');

    let isLoggedIn = false;

    // Request initial auth status
    vscode.postMessage({ type: 'requestTokenStatus' });

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'tokenStatus':
          isLoggedIn = message.value;
          if (isLoggedIn) {
            statusEl.textContent = 'Authenticated';
            statusEl.style.color = 'var(--vscode-testing-iconPassed)';
            statusEl.style.borderColor = 'var(--vscode-testing-iconPassed)';
          } else {
            statusEl.textContent = 'Auth Required';
            statusEl.style.color = 'var(--vscode-testing-iconFailed)';
            statusEl.style.borderColor = 'var(--vscode-testing-iconFailed)';
          }
          break;
        case 'response':
          typingIndicator.classList.remove('active');
          addMessage(message.value, 'ai');
          sendBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Send';
          sendBtn.disabled = false;
          inputEl.focus();
          break;
        case 'error':
          typingIndicator.classList.remove('active');
          addMessage('Error: ' + message.value, 'ai');
          sendBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Send';
          sendBtn.disabled = false;
          break;
      }
    });

    // Simple markdown-to-html helper for bold and code blocks
    function formatMessage(text) {
      // Escape HTML
      let html = text.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag]));
        
      // Code blocks
      html = html.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
      // Inline code
      html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
      // Bold
      html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      // Newlines
      html = html.replace(/\\n/g, '<br/>');
      return html;
    }

    function addMessage(text, sender) {
      const div = document.createElement('div');
      div.className = 'message ' + sender;
      div.innerHTML = sender === 'ai' ? formatMessage(text) : text;
      chatContainer.appendChild(div);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessage() {
      if (!isLoggedIn) {
        addMessage('Please log in first using the "AI360: Login" command.', 'ai');
        return;
      }
      
      const text = inputEl.value.trim();
      if (!text) return;

      // Unescaped for user text so it matches what they typed, but escaped in display
      const escapedText = text.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag]));
        
      addMessage(escapedText, 'user');
      inputEl.value = '';
      
      // Auto-resize textarea reset
      inputEl.style.height = 'auto';

      sendBtn.innerHTML = 'Thinking...';
      sendBtn.disabled = true;
      typingIndicator.classList.add('active');

      vscode.postMessage({
        type: 'sendMessage',
        value: text,
        model: modelSelect.value
      });
    }

    // Auto-resize textarea
    inputEl.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      if (this.scrollHeight > 200) {
        this.style.overflowY = 'auto';
      } else {
        this.style.overflowY = 'hidden';
      }
    });

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  </script>
</body>
</html>`;
  }
}
