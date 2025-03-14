const PARTY_NAMES = {
    'kd': 'Kristillisdemokraatteja',
    'kesk': 'Keskustaa',
    'kok': 'Kokoomusta',
    'lib': 'Liberaalipuoluetta',
    'nyt': 'Liike Nytiä',
    'ps': 'Perussuomalaisia',
    'rkp': 'RKP:ta',
    'sdp': 'SDP:tä',
    'vas': 'Vasemmistoliittoa',
    'vihr': 'Vihreitä'
}

const INITIAL_SUGGESTIONS = {
    'kd': ['Perhepolitiikka', 'Talous', 'Sosiaalipalvelut', 'Turvallisuus'],
    'kesk': ['Sosiaalipolitiikka', 'Koulutus', 'Perhepolitiikka', 'Yrittäjyys'],
    'kok': ['Talous', 'Hyvinvointi', 'Kansainvälisyys', 'Yrittäjyys'],
    'lib': ['Vapaus', 'Sosiaalipolitiikka', 'Talous', 'Kaupungit'],
    'nyt': ['Talous', 'Sosiaalipolitiikka', 'Koulutus', 'Vanhuspalvelut'],
    'ps': ['Maahanmuutto', 'Talous', 'Turvallisuus', 'Koulutus'],
    'rkp': ['Kaksikielisyys', 'Pohjoismaisuus', 'Talous', 'Koulutus'],
    'sdp': ['Talous', 'Sosiaaliturva', 'Koulutus', 'Tasa-arvo'],
    'vas': ['Oikeudenmukaisuus', 'Työelämä', 'Hyvinvointi', 'Ympäristönsuojelu'],
    'vihr': ['Ilmasto', 'Ihmisoikeudet', 'Koulutus', 'Talous']
}

const initPage = () => {

    const urlSearchParams = new URLSearchParams(window.location.search)
    const partyId = urlSearchParams.get('partyId')
    const profileId = urlSearchParams.get('profileId')
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

    const createTextButton = (title, onClick) => {
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

    const scrollToConversationBottom = () => {
        conversationContainer.scrollTo({
            top: conversationContainer.scrollHeight,
            behavior: 'smooth'
        })
    }

    const addMessage = (text, sender, includeThumbs) => {
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
            const onThumbSelected = (text) => {
                latestUserAction = 'THUMB'
                sendMessage(text, false)
            }
            thumbsDiv.appendChild(createImageButton('thumb-up', () => onThumbSelected('Olen samaa mieltä')))
            thumbsDiv.appendChild(createImageButton('thumb-down', () => onThumbSelected('En ole samaa mieltä')))
            contentAndThumbsDiv.appendChild(thumbsDiv)
        }
        messageDiv.appendChild(contentAndThumbsDiv)
        if (sender === 'assistant') {
            const shortcutsDiv = document.createElement('div')
            shortcutsDiv.classList.add('shortcutsContainer')
            const shortcuts = document.createElement('div')
            shortcuts.classList.add('shortcuts')
            shortcutsDiv.appendChild(shortcuts)
            messageDiv.appendChild(shortcutsDiv)
        }
        conversationContainer.appendChild(messageDiv)
        conversationContainer.scrollTop = conversationContainer.scrollHeight
        return messageDiv
    }

    const createSuggestionButtons = (suggestions, areInitialSuggestions) => {
        let items = suggestions.map((s) => (
            {
                buttonTitle: s,
                message: s
            }
        ))
        if (areInitialSuggestions) {
            items.unshift({
                buttonTitle: 'Kunta- ja aluevaalit 2025',
                message: 'Kerro kuntavaaliohjelmasta ja kerro aluevaaliohjelmasta.'
            })
        } else {
            let extraShortcutCandidates  = []
            if (latestUserAction !== 'THUMB') {
                extraShortcutCandidates.push(_.sample([
                    { buttonTitle: 'Kerro lisää', message: 'Kerro lisää tästä aiheesta' },
                    { buttonTitle: 'Miksi?', message: 'Miksi?' },
                    { buttonTitle: 'Perustele', message: 'Anna perusteluja tämän mielipiteen tueksi' }
                ]))
            }
            extraShortcutCandidates.push(_.sample([
                { buttonTitle: 'Mitä muuta kannatat?', message: 'Mitä muuta kannatat?' },
                { buttonTitle: 'Kerro muista tavoitteistasi', message: 'Kerro muista tavoitteista' },
                { buttonTitle: 'Mitä muuta pidätte tärkeänä?', message: 'Mitä muuta pidätte tärkeänä?' }
            ]))
            items = [
                ...extraShortcutCandidates,
                ...items
            ]
        }
        return items.map((item) => createTextButton(item.buttonTitle, () => {
            latestUserAction = 'SHORTCUT'
            sendMessage(item.message, false)
        }))
    }

    const sendMessage = async (text, showQuestion = true) => {
        const isFirstQuestion = (conversationId === undefined)
        if (showQuestion) {
            addMessage(text, 'user', false)
        }
        const messageDiv = addMessage('...', 'assistant', (latestUserAction !== 'THUMB'))
        messageDiv.classList.add('pending')
        const response = await sendApiRequest('chat', {
            question: text,
            partyId,
            conversationId
        })
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

    const deleteThread = async (conversationId) => {
        await fetch('/api/deleteConversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversationId })
        })
    }    

    profileImageElement.src = `/images/avatars/${partyId}-${profileId}.png`
    const initialMessageDiv = addMessage(`Hei! Olen tekoälyn luoma virtuaaliehdokas ja edustan ${PARTY_NAMES[partyId]}. Voit valita alta puolueemme ohjelmiin liittyvän teeman tai kysyä vapaasti - vastaan parhaani mukaan!` , 'assistant', false) 
    appendChildren(
        createSuggestionButtons(INITIAL_SUGGESTIONS[partyId], true),
        getChildElement('shortcuts', initialMessageDiv)
    )

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
     })
}

document.addEventListener('DOMContentLoaded', () => initPage())
