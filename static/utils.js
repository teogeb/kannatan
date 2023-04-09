const STATEMENTS_PER_PARTY = 20

let sessionId

const PARTIES = {
    kd: { name: 'Kristillis&shy;demokraatit' },
    kesk: { name: 'Keskusta' },
    kok: { name: 'Kokoomus' },
    lib: { name: 'Liberaalipuolue' },
    nyt: { name: 'Liike Nyt' },
    ps: { name: 'Perus&shy;suomalaiset' },
    rkp: { name: 'RKP' },
    sdp: { name: 'SDP' },
    vas: { name: 'Vasemmisto&shy;liitto' },
    vihr: { name: 'Vihreät' }
}

const createStatementElement = (statement, onClick) => {
    const element = document.createElement('div')
    element.innerHTML = `
        <div class="speech-bubble">
            <p>${statement.phrase}</p>
        </div> `
    element.classList.add('statement')
    if (onClick !== undefined) {
        element.classList.add('clickable')
        element.addEventListener('click', () => onClick(statement, element))
    }
    return element
}

const createStatementVisibilityObserver = () => {
    let that = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
                that.unobserve(entry.target)
            }
        })
    })
    return that
}

const showDialog = (header, text, buttonLabel, onSubmit) => {
    const element = document.getElementById('dialog')
    element.innerHTML = `
        <h1>${header}</h1>
        <p>${text}</p>
        <div class="button">${buttonLabel}</div>`
    element.classList.add('visible')
    element.getElementsByClassName('button')[0].addEventListener('click', () => {
        element.classList.remove('visible')
        element.innerHTML = ''
        onSubmit()
    })
}

const apiRequest = async (endpoint, payload = {}) => {
    const options = {
        body: JSON.stringify({ ...payload, sessionId: getSessionId() } ),
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    }
    const response = await fetch(endpoint, options)
    return await response.json()
}

const getSessionId = () => {
    const queryParams = new URLSearchParams(window.location.search)
    const sessionId = queryParams.get('s')
    if (sessionId !== null) {
        return sessionId
    } else {
        return undefined
    }
}

