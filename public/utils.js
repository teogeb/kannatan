const getChildElement = (className, container) => {
    return container.getElementsByClassName(className)[0]
}

const appendChildren = (elements, target) => {
    for (const element of elements) {
        target.appendChild(element)
    }
}

const isMobile = () => {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    return regex.test(navigator.userAgent)
}

const initSubmitButtonStateController = (button, input) => {
    const updateState = () => {
        button.disabled = input.value.trim() === ''
    }
    input.addEventListener('input', updateState)
    updateState()
}

const sendApiRequest = async (endpoint, body) => {
    const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })
    return JSON.parse(await response.text())
}
