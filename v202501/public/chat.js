const fetchResponse = async (question, metadata) => {
    const response = await fetch('/api/dialogue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            ...metadata
        })
    })
    return JSON.parse(await response.text())
}

const PARTY_NAMES = {
    'kd': 'Kristillisdemokraatteja',
    'kesk': 'Keskustaa',
    'kok': 'Kokoomusta',
    'ps': 'Perussuomalaisia',
    'rkp': 'RKP:ta',
    'sdp': 'SDP:tä',
    'vas': 'Vasemmistoliittoa',
    'vihr': 'Vihreitä'
}

const PROFILE_IMAGES_URLS = {
    'kd': '/images/kd-1716250767.png',
    'kesk': '/images/kesk-1715643393-2.png',
    'kok': '/images/kok-1715642909.png',
    'ps': '/images/ps-1716251177.png',
    'rkp': '/images/rkp-1715642415.png',
    'sdp': '/images/sdp-1715643055.png',
    'vas': '/images/vas-1716252125-2.png',
    'vihr': '/images/vihr-1716252407.png'
}

const initPage = () => {

    const partyId = new URLSearchParams(window.location.search).get('partyId')

    const profileImageElement = document.getElementById('profileImage')
    const dialogueContainer = document.getElementById('dialogue')
    const questionInput = document.getElementById('question')
    const sendButton = document.getElementById('sendButton')
    let dialogueId = undefined

    function addMessage(text, sender) {
        const messageDiv = document.createElement('p')
        messageDiv.classList.add(sender === 'user' ? 'user' : 'bot')
        messageDiv.textContent = text
        dialogueContainer.appendChild(messageDiv)
        dialogueContainer.scrollTop = dialogueContainer.scrollHeight
        return messageDiv
    }

    profileImageElement.src = PROFILE_IMAGES_URLS[partyId]

    addMessage(`Hei! Olen tekoälyn luoma virtuaaliehdokas. Edustan ${PARTY_NAMES[partyId]}. Mistä juteltaisiin?`, 'bot')

    const sendQuestion = async () => {
        const userMessage = questionInput.value.trim()
        if (userMessage) {
            const isFirstQuestion = (dialogueId === undefined)
            addMessage(userMessage, 'user')
            questionInput.value = ''
            const answerDiv = addMessage('...', 'assistant')
            answerDiv.classList.add('pending')
            const response = await fetchResponse(userMessage, isFirstQuestion ? { partyId } : { dialogueId })
            answerDiv.textContent = response.answer
            answerDiv.classList.remove('pending')
            if (isFirstQuestion) {
                dialogueId = response.dialogueId
            }
            dialogueContainer.scrollTop = dialogueContainer.scrollHeight
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