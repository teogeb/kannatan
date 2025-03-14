const initPage = () => {

    const feedbackContainer = document.getElementById('feedback')
    const feedbackInput = feedbackContainer.getElementsByTagName('textarea')[0]
    const feedbackButton = feedbackContainer.getElementsByTagName('button')[0]
    const sendFeedback = async () => {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: feedbackInput.value
            })
        })
        const status = JSON.parse(await response.text()).status
        if (status === 'success') {
            const statusDiv = feedbackContainer.querySelector('#status')
            statusDiv.classList.remove('invisible')
            feedbackInput.value = ''
            feedbackButton.disabled = true
        } else {
            alert('Virhe')
        }
    }
    feedbackButton.addEventListener('click', sendFeedback)
    initSubmitButtonStateController(feedbackButton, feedbackInput)

    const additionalInfo = document.getElementById('additional-info')
    additionalInfo.querySelector('.open-link').addEventListener('click', () => {
        const details = additionalInfo.querySelector('.details')
        details.classList.remove('hidden')
        details.scrollIntoView({ behavior: 'smooth' })
    })
}

document.addEventListener('DOMContentLoaded', () => initPage())
