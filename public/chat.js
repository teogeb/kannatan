const fetchResponse = async (question, metadata) => {
    if (new URLSearchParams(window.location.search).get('mockData') === 'true') {  // TODO remove this
        return {
            answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere varius mattis. Aliquam erat volutpat. Etiam facilisis consectetur sem, eu pulvinar odio dignissim ut. Cras pulvinar diam magna, eget iaculis neque pretium nec',
            suggestions: ['Suggestion 1', 'Suggestion 2']
        }
    }
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

const getChildElement = (className, container) => {
    return container.getElementsByClassName(className)[0]
}

const appendChildren = (elements, target) => {
    for (const element of elements) {
        target.appendChild(element)
    }
}

const initPage = () => {

    const partyId = new URLSearchParams(window.location.search).get('partyId')

    const profileImageElement = getChildElement('profileImage', document)
    const conversationContainer = document.getElementById('conversation')
    const questionInput = document.getElementById('question')
    const sendButton = document.getElementById('sendButton')
    let conversationId = undefined
    let latestUserAction = undefined

    const focusQuestionInput = () => {
        if (!isMobile()) {
            questionInput.focus()
        }
    }

    const createButton = (title, onClick) => {
        const btn = document.createElement('div')
        btn.classList.add('button')
        btn.textContent = title
        btn.onclick = () => {
            btn.classList.add('selected')
            focusQuestionInput()
            onClick()
        }
        return btn
    }

    const createImageButton = (iconId, onClick) => {
        const btn = document.createElement('div')
        btn.classList.add('button')
        btn.innerHTML = `<img src="/images/${iconId}.svg" class="icon"/>`
        btn.onclick = () => {
            btn.classList.add('selected')
            focusQuestionInput()
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
        const contentAndThumbsDiv = document.createElement('div')
        contentAndThumbsDiv.classList.add('contentAndThumbs')
        const contentDiv = document.createElement('p')
        contentDiv.classList.add('content')
        contentDiv.textContent = text
        contentAndThumbsDiv.appendChild(contentDiv)
        if (includeThumbs) {
            const thumbsDiv = document.createElement('div')
            thumbsDiv.classList.add('thumbs')
            // TODO use e.g. SVG so that we can have a separate hover color?
            // TODO could tweak the phrasing of the messages these buttons send?
            const onThumbSelected = (text) => {
                latestUserAction = 'THUMB'
                sendMessage(text, false)
            }
            thumbsDiv.appendChild(createImageButton('face-smile-solid', () => onThumbSelected('Olen samaa mieltä')))
            thumbsDiv.appendChild(createImageButton('circle-xmark-solid', () => onThumbSelected('En ole samaa mieltä')))
            contentAndThumbsDiv.appendChild(thumbsDiv)
        }
        messageDiv.appendChild(contentAndThumbsDiv)
        const shortcuts = document.createElement('div')
        shortcuts.classList.add('shortcuts')
        messageDiv.appendChild(shortcuts)
        conversationContainer.appendChild(messageDiv)
        conversationContainer.scrollTop = conversationContainer.scrollHeight
        return messageDiv
    }

    function createSuggestionButtons(suggestions, areInitialSuggestions) {
        const btnContainer = document.createElement('div')
        btnContainer.classList.add('suggestions')
        let items = suggestions.map((s) => (
            {
                buttonTitle: s,
                message: s
            }
        ))
        if (!areInitialSuggestions) {
            let extraShortcutCandidates  = [
                { buttonTitle: 'Mitä muuta kannatat?', message: 'Mitä muuta kannatat?' }
            ]
            if (latestUserAction !== 'THUMB') {
                extraShortcutCandidates.push(
                    { buttonTitle: 'Kerro lisää', message: 'Kerro lisää tästä aiheesta' },
                    { buttonTitle: 'Miksi?', message: 'Miksi?' }
                )
            }
            items = [
                _.sample(extraShortcutCandidates),  // TODO some better logic than just random (maybe on server-side?)
                ...items
            ]
        }
        return items.map((item) => createButton(item.buttonTitle, () => {
            latestUserAction = 'SHORTCUT'
            sendMessage(item.message, false)
        }))
    }

    profileImageElement.src = PROFILE_IMAGES_URLS[partyId]

    const initialMessageDiv = addMessage(`Hei! Olen tekoälyn luoma virtuaaliehdokas ja edustan ${PARTY_NAMES[partyId]}. Voit valita alta puolueemme ohjelmiin liittyvän teeman tai kysyä vapaasti - vastaan parhaani mukaan!` , 'assistant', false) 
    appendChildren(
        createSuggestionButtons(SUGGESTIONS[partyId], true),
        getChildElement('shortcuts', initialMessageDiv)
    )    

    const sendMessage = async (text, showQuestion = true) => {
        const isFirstQuestion = (conversationId === undefined)
        if (showQuestion) {
            addMessage(text, 'user', false)
        }
        const messageDiv = addMessage('...', 'assistant', (latestUserAction !== 'THUMB'))
        messageDiv.classList.add('pending')
        const response = await fetchResponse(text, isFirstQuestion ? { partyId } : { partyId, conversationId })
        messageDiv.getElementsByTagName('p')[0].textContent = response.answer
        messageDiv.classList.remove('pending')
        if (isFirstQuestion) {
            conversationId = response.conversationId
        }
        const suggestions = response.suggestions
        appendChildren(
            createSuggestionButtons(suggestions, false),
            getChildElement('shortcuts', messageDiv)
        )
        scrollToConversationBottom()
    }

    const sendQuestion = async () => {
        const question = questionInput.value.trim()
        if (question !== '') {
            latestUserAction = 'ASK'
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