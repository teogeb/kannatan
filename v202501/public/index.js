const sendQuestion = async () => {
    return {
        answer: 'Foobar',
        sessionId: 'foo-session-id'
    }
}

const sendData = async () => {
    const question = document.getElementById('question').value
    const sessionId = document.getElementById('sessionId').value
    const partyId = document.getElementById('partyId').value
    const locationId = document.getElementById('locationId').value
    document.getElementById('answer').innerText = '...'
    try {
        let body = {
            question
        }
        if (sessionId !== '') {
            body = {
                ...body,
                sessionId
            }
        } else {
            body = {
                ...body,
                partyId,
                locationId
            }
        }
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            const { answer, sessionId } = JSON.parse(await response.text())
            document.getElementById('answer').innerText = answer
            document.getElementById('sessionId').value = sessionId
        } else {
            alert('Failed to send data. Please try again.')
        }
    } catch (error) {
        console.error('Error sending data:', error);
        alert('An error occurred while sending data.')
    }
}

const initPage = () => {

    const chatBox = document.getElementById('dialogue');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // Function to create a message bubble
    function addMessage(text, sender = 'user') {
        const messageDiv = document.createElement('p');
        messageDiv.classList.add(sender === 'user' ? 'user' : 'bot');
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
    }

    // Simulate bot response
    function getBotResponse(userMessage) {
        return `You said: "${userMessage}". How can I assist further?`; // Replace with actual AI response
    }

    setTimeout(() => {
        addMessage('Foo', 'bot');
    }, 500);

    setTimeout(() => {
        addMessage('Bar', 'bot');
    }, 1000);

    // Handle send button click
    sendButton.addEventListener('click', () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            addMessage(userMessage, 'user');
            chatInput.value = '';
            // Simulate a bot response
            setTimeout(() => {
                const botResponse = getBotResponse(userMessage);
                addMessage(botResponse, 'bot');
            }, 500);
        }
    });

    // Handle Enter key in the input
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    /*const questionElement = document.getElementById('question')
    const dialogueElement = document.getElementById('dialogue')
    questionElement.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()  // Prevent default form submission
            const { answer, sessionId } = await sendQuestion()
            console.log(answer)
            questionElement.value = ''
            const answerElement = document.createElement('p')
            answerElement.className = 'assistant'
            answerElement.textContent = answer
            dialogueElement.appendChild(answerElement)
            dialogueElement.scrollTop = dialogueElement.scrollHeight
        }
    })
    document.getElementById('partyId').addEventListener('change', (event) => {
        document.getElementById('sessionId').value = ''
    })
    document.getElementById('locationId').addEventListener('change', (event) => {
        document.getElementById('sessionId').value = ''
    })*/
}


document.addEventListener('DOMContentLoaded', () => initPage())