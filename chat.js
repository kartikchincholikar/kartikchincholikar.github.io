// chat.js
const CHAT_ENDPOINT = "https://qknhqyqpjmpgytqqqvrs.supabase.co/functions/v1/chat-agent"; // REPLACE THIS
const SESSION_ID = Math.random().toString(36).substring(7);

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject HTML for Chat Widget
    const chatHTML = `
        <div id="chat-container">
            <div id="chat-window">
                <div id="chat-header">
                    <span>TERMINAL_LINK</span>
                    <button id="close-chat">X</button>
                </div>
                <div id="chat-messages">
                    <div class="message system">system: online. ask me anything.</div>
                </div>
                <div id="chat-input-area">
                    <input type="text" id="chat-input" placeholder="TYPE HERE..." autocomplete="off">
                    <button id="send-btn">></button>
                </div>
            </div>
            <button id="chat-toggle-btn">
                <span class="icon">?</span>
            </button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 2. Elements
    const chatWindow = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const messages = document.getElementById('chat-messages');

    // 3. Event Listeners
    toggleBtn.addEventListener('click', () => chatWindow.style.display = 'flex');
    closeBtn.addEventListener('click', () => chatWindow.style.display = 'none');

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add User Message
        appendMessage('user', text);
        input.value = '';
        appendMessage('system', '...', true); // Loading

        try {
            const response = await fetch(CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, session_id: SESSION_ID })
            });
            const data = await response.json();

            // Remove loading
            messages.lastElementChild.remove();

            // Process Media Tags
            let reply = data.reply;
            const mediaRegex = /\[RENDER_MEDIA:\s*(.*?)\]/;
            const match = reply.match(mediaRegex);
            let mediaHtml = '';

            if (match) {
                const url = match[1];
                reply = reply.replace(match[0], ''); // Remove tag from text

                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const videoId = url.split('v=')[1] || url.split('/').pop();
                    mediaHtml = `<div class="media-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0"></iframe></div>`;
                } else if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
                    mediaHtml = `<div class="media-embed"><img src="${url}" alt="media" /></div>`;
                } else if (url.includes('arxiv')) {
                    mediaHtml = `<div class="media-embed"><a href="${url}" target="_blank">[OPEN PDF]</a></div>`;
                }
            }

            appendMessage('agent', reply + mediaHtml);

        } catch (err) {
            messages.lastElementChild.remove();
            appendMessage('system', 'error: connection lost.');
        }
    }

    function appendMessage(sender, html, isLoading = false) {
        const div = document.createElement('div');
        div.className = `message ${sender} ${isLoading ? 'loading' : ''}`;
        div.innerHTML = html; // Allow HTML for embeds
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
});