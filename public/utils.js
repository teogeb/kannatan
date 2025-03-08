const initSubmitButtonStateController = (button, input) => {
    const updateState = () => {
        button.disabled = input.value.trim() === ''
    }
    input.addEventListener('input', updateState);
    updateState()
}