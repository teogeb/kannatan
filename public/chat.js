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
    await fetch('/api/deleteConversation', {
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
    'kd': ['Perhepolitiikka', 'Talous', 'Sosiaalipalvelut', 'Turvallisuus'],
    'kesk': ['Sosiaalipolitiikka', 'Koulutus', 'Perhepolitiikka', 'Yrittäjyys'],
    'kok': ['Talous', 'Hyvinvointi', 'Kansainvälisyys', 'Yrittäjyys'],
    'ps': ['Maahanmuutto', 'Talous', 'Turvallisuus', 'Koulutus'],
    'rkp': ['Kaksikielisyys', 'Pohjoismaisuus', 'Talous', 'Koulutus'],
    'sdp': ['Talous', 'Sosiaaliturva', 'Koulutus', 'Tasa-arvo'],
    'vas': ['Oikeudenmukaisuus', 'Työelämä', 'Hyvinvointi', 'Ympäristönsuojelu'],
    'vihr': ['Ilmasto', 'Ihmisoikeudet', 'Koulutus', 'Talous']
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

function isMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}

const initPage = () => {

    const partyId = new URLSearchParams(window.location.search).get('partyId')

    const profileImageElement = document.getElementById('profileImage')
    const conversationContainer = document.getElementById('conversation')
    const questionInput = document.getElementById('question')
    const sendButton = document.getElementById('sendButton')
    let conversationId = undefined

    const createButton = (title, onClick) => {
        const btn = document.createElement('div')
        btn.classList.add('button')
        btn.textContent = title
        btn.onclick = () => {
            btn.classList.add('selected')
            if (!isMobile()) {
                questionInput.focus()
            }
            onClick()
        }
        return btn
    }

    function scrollToConversationBottom() {
        conversationContainer.scrollTo({
            top: conversationContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    function addMessage(text, sender, includeThumbs) {
        const messageDiv = document.createElement('div')
        messageDiv.classList.add('message', sender)
        const contentDiv = document.createElement('p')
        contentDiv.classList.add('content')
        contentDiv.textContent = text
        messageDiv.appendChild(contentDiv)
        if (includeThumbs) {
            const thumbsDiv = document.createElement('div')
            thumbsDiv.classList.add('thumbs')
            // TODO use e.g. SVG so that we can have a separate hover color?
            // TODO could tweak the phrasing of the messages these buttons send?
            thumbsDiv.appendChild(createButton('\u{1F44D}', () => sendMessage('Olen samaa mieltä', false)))
            thumbsDiv.appendChild(createButton('\u{1F44E}', () => sendMessage('En ole samaa mieltä', false)))
            messageDiv.appendChild(thumbsDiv)
        }
        conversationContainer.appendChild(messageDiv)
        conversationContainer.scrollTop = conversationContainer.scrollHeight
        return messageDiv
    }

    function addSuggestions(suggestions, areInitialSuggestions) {
        const btnContainer = document.createElement('div')
        btnContainer.classList.add('buttons')
        let items = suggestions.map((s) => (
            {
                buttonTitle: s,
                message: s
            }
        ))
        if (!areInitialSuggestions) {
                items = [
                    {
                        buttonTitle: 'Kerro lisää',
                        message: 'Kerro lisää tästä aiheesta'
                    },
                    ...items
                ]
        }
        for (let item of items) {
            const btn = createButton(item.buttonTitle, () => sendMessage(item.message, false))
            btnContainer.appendChild(btn)
        }
        conversationContainer.appendChild(btnContainer)
    }

    profileImageElement.src = PROFILE_IMAGES_URLS[partyId]

    addMessage(`Hei! Olen tekoälyn luoma virtuaaliehdokas ja edustan ${PARTY_NAMES[partyId]}. Voit valita alta puolueemme ohjelmiin liittyvän teeman tai kysyä vapaasti - vastaan parhaani mukaan!` , 'assistant', false) 
    addSuggestions(SUGGESTIONS[partyId], true)

    const sendMessage = async (text, showQuestion = true) => {
        const isFirstQuestion = (conversationId === undefined)
        if (showQuestion) {
            addMessage(text, 'user', false)
        }
        const answerDiv = addMessage('...', 'assistant', true)
        answerDiv.classList.add('pending')
        const response = await fetchResponse(text, isFirstQuestion ? { partyId } : { partyId, conversationId })
        answerDiv.getElementsByTagName('p')[0].textContent = response.answer
        answerDiv.classList.remove('pending')
        if (isFirstQuestion) {
            conversationId = response.conversationId
        }
        const suggestions = response.suggestions
        addSuggestions(suggestions, false)
        scrollToConversationBottom()
    }

    const sendQuestion = async () => {
        const question = questionInput.value.trim()
        if (question !== '') {
            questionInput.value = ''
            sendMessage(question)
        }
    }

    sendButton.addEventListener('click', () => {
        sendQuestion()
        focusQuestionInput()
    })
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