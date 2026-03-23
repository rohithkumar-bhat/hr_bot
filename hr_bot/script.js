// FastAPI backend endpoint
const API_URL = "/api/chat";

const messagesContainer = document.getElementById('messages-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearChatButton = document.getElementById('clear-chat');

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Handle send button click
sendButton.addEventListener('click', sendMessage);

// Handle Enter key (Shift+Enter for new line)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Clear chat
clearChatButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
        messagesContainer.innerHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    Hello! I'm your AI HR Assistant. How can I help you today?
                </div>
                <div class="message-time">Just now</div>
            </div>
        `;
    }
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add user message to UI
    appendMessage('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show typing indicator
    const typingIndicator = appendMessage('bot', '...', true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        // Remove typing indicator and add real response
        typingIndicator.remove();
        appendMessage('bot', botResponse);

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        appendMessage('bot', 'Sorry, I encountered an error connecting to the HR system. Please try again later.');
    }
}

function appendMessage(sender, text, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-time">${isTyping ? 'Typing...' : time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}
