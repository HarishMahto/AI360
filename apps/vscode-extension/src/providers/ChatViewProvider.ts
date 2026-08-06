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
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      padding: 10px;
      display: flex;
      flex-direction: column;
      height: 100vh;
      box-sizing: border-box;
    }
    #chat-container {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .message {
      padding: 8px 12px;
      border-radius: 6px;
      max-width: 90%;
      word-wrap: break-word;
    }
    .user {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      align-self: flex-end;
    }
    .ai {
      background-color: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border);
      align-self: flex-start;
    }
    .input-container {
      display: flex;
      gap: 5px;
      flex-direction: column;
    }
    textarea {
      width: 100%;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 8px;
      resize: vertical;
      min-height: 60px;
      font-family: inherit;
    }
    select {
      background: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      padding: 4px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px;
      cursor: pointer;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .status {
      font-size: 0.8em;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div id="status" class="status">Checking authentication...</div>
  
  <div id="chat-container"></div>
  
  <div class="input-container">
    <select id="model-select">
      <option value="gpt-4o-mini">GPT-4o Mini</option>
      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
      <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
    </select>
    <textarea id="prompt-input" placeholder="Ask AI360..."></textarea>
    <button id="send-button">Send</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    const statusEl = document.getElementById('status');
    const chatContainer = document.getElementById('chat-container');
    const inputEl = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-button');
    const modelSelect = document.getElementById('model-select');

    let isLoggedIn = false;

    // Request initial auth status
    vscode.postMessage({ type: 'requestTokenStatus' });

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'tokenStatus':
          isLoggedIn = message.value;
          if (isLoggedIn) {
            statusEl.textContent = 'Authenticated via AI360';
            statusEl.style.color = 'var(--vscode-testing-iconPassed)';
          } else {
            statusEl.textContent = 'Not logged in. Use command "AI360: Login"';
            statusEl.style.color = 'var(--vscode-testing-iconFailed)';
          }
          break;
        case 'response':
          addMessage(message.value, 'ai');
          sendBtn.textContent = 'Send';
          sendBtn.disabled = false;
          break;
        case 'error':
          addMessage('Error: ' + message.value, 'ai');
          sendBtn.textContent = 'Send';
          sendBtn.disabled = false;
          break;
      }
    });

    function addMessage(text, sender) {
      const div = document.createElement('div');
      div.className = 'message ' + sender;
      div.textContent = text;
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

      addMessage(text, 'user');
      inputEl.value = '';
      sendBtn.textContent = 'Thinking...';
      sendBtn.disabled = true;

      vscode.postMessage({
        type: 'sendMessage',
        value: text,
        model: modelSelect.value
      });
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keypress', (e) => {
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
