let typingActive = false; // Variable to track typing state
        let typingTimeout; // Variable to hold the timeout reference

        window.onload = function() {
            // No initial message generation
        };

        function sendMessage() {
            var input = document.getElementById("chat-input");
            var message = input.value.trim();
            if (message !== "") {
                appendMessage("user", message);
                input.value = ""; // Clear input field

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/chat", true);
                xhr.setRequestHeader("Content-Type", "application/json");

                // Show loading indicator and keep stop button visible
                document.getElementById("loading").style.display = "block";
                document.getElementById("stop-button").style.display = "inline-block"; // Keep the stop button visible

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        document.getElementById("loading").style.display = "none";
                        // Do not hide the stop button here

                        var response = JSON.parse(xhr.responseText);
                        typeWriter(response.response);
                    }
                };
                xhr.send(JSON.stringify({ "message": message }));
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
                        <p>${sender === "user" ? "" + message : message}</p>
                    </div>
                </div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
        }

        function typeWriter(text) {
            let index = 0;
            const speed = 50; // typing speed in milliseconds
            const chatMessages = document.getElementById("chat-messages");
            const botMessage = document.createElement("div");
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
            
            typingActive = true; // Set typing active to true

            function typing() {
                if (index < text.length && typingActive) {
                    botMessage.querySelector(".message-bubble p").textContent += text.charAt(index);
                    index++;
                    typingTimeout = setTimeout(typing, speed); // Save the timeout reference
                } else {
                    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
                    typingActive = false; // Reset typing active when done
                }
            }
            typing();
        }

        function stopTyping() {
            typingActive = false; // Set typing active to false
            clearTimeout(typingTimeout); // Clear the timeout to stop typing
            var lastMessage = document.getElementById("chat-messages").lastChild.querySelector(".message-bubble p");
            lastMessage.textContent += " (Stopped)"; // Indicate that typing was stopped
        }

        // Add event listener for Enter key
        document.getElementById('chat-input').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission
                sendMessage(); // Call the sendMessage function
            }
        });

