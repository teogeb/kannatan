const initCompareStatementsPage = (compareStatements, pickedStatements) => {

    const showPageCompleteDialog = async (selectedStatements) => {
        const topParty = (await apiRequest('/api/statements/compare', {
            comparedStatementIds: _.map(selectedStatements, 'id'),
            pickedStatementIds: _.map(pickedStatements, 'id')
        })).topParty
        showDialog(
            `Sinulle paras puolue on`,
            `${PARTIES[topParty].name}`,
            'Selvä!',
            () => window.location.href = `/e/1/${topParty}`
        )
    }

    const rootElement = document.getElementById('root')
    rootElement.innerHTML = `
        <h1>Kumpi tärkeämpää?</h1>
        <div class="progress-bar"></div>
    `

    const progressBar = rootElement.getElementsByClassName('progress-bar')[0]
    let selectedStatements = []
    const roundCount = compareStatements.length
    const setStatementsElements = (currentRound) => {
        const observer = createStatementVisibilityObserver()
        const statements = compareStatements[currentRound]
        for (let i = 0; i < statements.length; i++) {
            const element = createStatementElement(statements[i], (statement, element) => {
                if (!element.classList.contains('selected')) {
                    selectedStatements.push(statement)
                    element.classList.add('selected')
                    if (currentRound === roundCount - 1) {
                        showPageCompleteDialog(selectedStatements)
                    } else {
                        setTimeout(() => {
                            for (const removable of Array.from(rootElement.getElementsByClassName('statement'))) {
                                removable.remove()
                            }
                            setStatementsElements(currentRound + 1)
                        }, 400)
                    }
                }
            })
            rootElement.appendChild(element)
            observer.observe(element)
            progressBar.innerHTML = `${currentRound + 1} / ${roundCount}`
        }

    }

    setStatementsElements(0)

}
