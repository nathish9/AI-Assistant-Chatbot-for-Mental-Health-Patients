let controller; // Declare a variable to hold the AbortController

function sendMessage() {
    var input = document.getElementById("chat-input");
    var message = input.value.trim();
    if (message !== "") {
        appendMessage("user", message);
        input.value = ""; // Clear input field

        // Create a new AbortController instance for each request
        controller = new AbortController();
        const signal = controller.signal;

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "message": message }),
            signal: signal // Pass the signal to the fetch request
        })
        .then(response => response.json())
        .then(data => typeWriter(data.response, 50)) // Call typeWriter with response and speed
        .catch(err => {
            if (err.name === 'AbortError') {
                console.log('Fetch request was aborted');
            } else {
                console.error('Fetch error:', err);
            }
        });
    }
}

function appendMessage(sender, message) {
    var chatMessages = document.getElementById("chat-messages");
    var messageDiv = document.createElement("div");
    messageDiv.classList.add(sender === "bot" ? "bot-message" : "user-message");
    messageDiv.innerHTML = `
        <div class="${sender}-avatar"></div>
        <div class="message-content">
            <div class="message-bubble">
                <p>${message}</p>
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
}

// Function to simulate typing effect
function typeWriter(text, speed) {
    var chatMessages = document.getElementById("chat-messages");
    var botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.innerHTML = `
        <div class="bot-avatar"></div>
        <div class="message-content">
            <div class="message-bubble">
                <p></p>
            </div>
        </div>
    `;
    chatMessages.appendChild(botMessage);

    let index = 0;

    function typing() {
        if (index < text.length) {
            botMessage.querySelector(".message-bubble p").textContent += text.charAt(index);
            index++;
            setTimeout(typing, speed); // Call typing function with defined speed
        } else {
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
        }
    }
    typing();
}

// Add event listener for Enter key
document.getElementById('chat-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        sendMessage(); // Call the sendMessage function
    }
});

// Add event listener for Stop button
document.querySelector('.stop-btn').addEventListener('click', function() {
    if (controller) {
        controller.abort(); // Abort the ongoing fetch request
        console.log('Chatbot response generation stopped.');
    }
});

function sendMessage() {
    var input = document.getElementById("chat-input");
    var message = input.value.trim();
    if (message !== "") {
        appendMessage("user", message);
        input.value = ""; // Clear input field

        // Show loading indicator
        document.querySelector('.loading').style.display = 'flex';

        // Create a new AbortController instance for each request
        controller = new AbortController();
        const signal = controller.signal;

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "message": message }),
            signal: signal // Pass the signal to the fetch request
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            document.querySelector('.loading').style.display = 'none';
            typeWriter(data.response, 50); // Call typeWriter with response and speed
        })
        .catch(err => {
            // Hide loading indicator
            document.querySelector('.loading').style.display = 'none';
            if (err.name === 'AbortError') {
                console.log('Fetch request was aborted');
            } else {
                console.error('Fetch error:', err);
            }
        });
    }
}