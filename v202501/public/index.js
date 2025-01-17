const wait = (ms) => {
      return new Promise(resolve => setTimeout(() => resolve(), ms));
}

const fetchResponse = async () => {
    await wait(500)
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
        })
        if (response.ok) {
            const { answer, sessionId } = JSON.parse(await response.text())
            document.getElementById('answer').innerText = answer
            document.getElementById('sessionId').value = sessionId
        } else {
            alert('Failed to send data. Please try again.')
        }
    } catch (error) {
        console.error('Error sending data:', error)
        alert('An error occurred while sending data.')
    }
}

const initPage = () => {

    const dialogueContainer = document.getElementById('dialogue')
    const questionInput = document.getElementById('question')
    const sendButton = document.getElementById('sendButton')

    function addMessage(text, sender) {
        const messageDiv = document.createElement('p')
        messageDiv.classList.add(sender === 'user' ? 'user' : 'bot')
        messageDiv.textContent = text
        dialogueContainer.appendChild(messageDiv)
        dialogueContainer.scrollTop = dialogueContainer.scrollHeight
        return messageDiv
    }

    addMessage('Olen tekoälyn luoma virtuaaliehdokas. Edustan TODO. Mistä juteltaisiin?', 'bot')

    const sendQuestion = async () => {
        const userMessage = questionInput.value.trim()
        if (userMessage) {
            addMessage(userMessage, 'user')
            questionInput.value = ''
            const answerDiv = addMessage('...', 'assistant')
            answerDiv.classList.add('pending')
            const response = await fetchResponse(userMessage)
            answerDiv.textContent = response.answer
            answerDiv.classList.remove('pending')
        }
    }

    sendButton.addEventListener('click', () => sendQuestion())
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendQuestion()
        }
    })
}


document.addEventListener('DOMContentLoaded', () => initPage())