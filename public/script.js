const socket = io();

// DOM Elements
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const messagesContainer = document.getElementById('messages-container');
const myUsernameEl = document.getElementById('my-username');
const activeUsersEl = document.getElementById('active-users');

let myUsername = '';

// Helper to scroll to bottom
const scrollToBottom = () => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Helper to append message
const appendMessage = (data, type) => {
    const div = document.createElement('div');

    if (type === 'system') {
        div.classList.add('system-message');
        div.textContent = data.text;
    } else {
        const isMine = data.username === myUsername;
        div.classList.add('message-row', isMine ? 'mine' : 'other');

        div.innerHTML = `
            <div class="message-bubble">${data.text}</div>
            <div class="message-meta">
                ${!isMine ? `<span class="username">${data.username}</span>` : ''}
                <span class="time">${data.time}</span>
            </div>
        `;
    }

    messagesContainer.appendChild(div);
    scrollToBottom();
};

// --- Socket Events ---

socket.on('welcome', (data) => {
    myUsername = data.username;
    myUsernameEl.textContent = myUsername;
    activeUsersEl.textContent = `${data.activeUsers} Online`;
});

socket.on('active_users', (data) => {
    activeUsersEl.textContent = `${data.count} Online`;
});

socket.on('user_joined', (data) => {
    appendMessage({ text: `${data.username} joined the chat` }, 'system');
});

socket.on('user_left', (data) => {
    appendMessage({ text: `${data.username} left the chat` }, 'system');
});

socket.on('message', (data) => {
    appendMessage(data, 'chat');
});




// --- UI Events ---

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = msgInput.value;

    if (msg.trim()) {
        socket.emit('message', msg);
        msgInput.value = '';
        msgInput.focus();
    }
});
