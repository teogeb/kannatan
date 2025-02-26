const fetchResponse = async (question, metadata) => {
    const response = await fetch('/api/chat', {
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

const deleteThread = async (conversationId) => {
    await fetch('/api/deleteThread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId })
    })
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

const SUGGESTIONS = {
    'kd': [],
    'kesk': [],
    'kok': [],
    'ps': [],
    'rkp': [],
    'sdp': [],
    'vas': [],
    'vihr': ['Ympäristönsuojelu', 'Sosiaalinen oikeudenmukaisuus', 'Kestävä kehitys']
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
    const conversationContainer = document.getElementById('conversation')
    const questionInput = document.getElementById('question')
    const sendButton = document.getElementById('sendButton')
    let conversationId = undefined

    function scrollToConversationBottom() {
        conversationContainer.scrollTo({
            top: conversationContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('p')
        messageDiv.classList.add(sender === 'user' ? 'user' : 'bot')
        messageDiv.textContent = text
        conversationContainer.appendChild(messageDiv)
        conversationContainer.scrollTop = conversationContainer.scrollHeight
        return messageDiv
    }

    function handleBtnClick(text) {
        questionInput.value = text
        sendQuestion()
    }

    function addSuggestions(suggestions) {
        const btnContainer = document.createElement('div')
        btnContainer.classList.add('buttons')
        for (let s of suggestions) {
            const btn = document.createElement('button')
            btn.textContent = s
            btn.onclick = () => handleBtnClick(s)
            btnContainer.appendChild(btn)
        }
        conversationContainer.appendChild(btnContainer)
    }

    profileImageElement.src = PROFILE_IMAGES_URLS[partyId]

    addMessage(`Hei! Olen tekoälyn luoma virtuaaliehdokas ja edustan ${PARTY_NAMES[partyId]}. Voit valita alta puolueemme ohjelmaan liittyvän teeman tai kysyä vapaasti - vastaan parhaani mukaan!` , 'bot')
    addSuggestions(SUGGESTIONS[partyId])

    const sendQuestion = async () => {
        const userMessage = questionInput.value.trim()
        if (userMessage) {
            const isFirstQuestion = (conversationId === undefined)
            addMessage(userMessage, 'user')
            questionInput.value = ''
            const answerDiv = addMessage('...', 'assistant')
            answerDiv.classList.add('pending')
            const response = await fetchResponse(userMessage, isFirstQuestion ? { partyId } : { partyId, conversationId })
            answerDiv.textContent = response.answer
            answerDiv.classList.remove('pending')
            if (isFirstQuestion) {
                conversationId = response.conversationId
            }
            const suggestions = response.suggestions
            addSuggestions(suggestions)
            scrollToConversationBottom()
        }
    }

    sendButton.addEventListener('click', () => sendQuestion())
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendQuestion()
        }
    })
    window.addEventListener('resize', () => {
        scrollToConversationBottom()
    })
    window.addEventListener('beforeunload', () => {
        if (conversationId !== undefined)
            deleteThread(conversationId)
     });
}


document.addEventListener('DOMContentLoaded', () => initPage())