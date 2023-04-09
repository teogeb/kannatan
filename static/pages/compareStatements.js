const ROUND_COUNT = 5

const initCompareStatementsPage = (allStatements, pickedStatements, pickedTopParties) => {

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

    const minPreferredLevel = _.max(pickedStatements.map((s) => s.level)) + 1
    let levels = _.sampleSize(_.range(minPreferredLevel, STATEMENTS_PER_PARTY), ROUND_COUNT)
    if (levels.length < ROUND_COUNT) {
        const pickedLevels = _.map(pickedStatements, 'level')
        const fallback = _.sampleSize(_.without(_.range(STATEMENTS_PER_PARTY), pickedLevels), ROUND_COUNT - levels.length)
        levels = _.shuffle(levels.concat(fallback))
    }
    const getRoundStatemements = (currentRound) => {
        const levelStatements = allStatements.filter((s) => s.level === levels[currentRound])
        return _.shuffle(levelStatements.filter((s) => pickedTopParties.includes(s.partyId)))
    }

    const progressBar = rootElement.getElementsByClassName('progress-bar')[0]
    let selectedStatements = []
    const setStatementsElements = (currentRound) => {
        const observer = createStatementVisibilityObserver()
        const statements = getRoundStatemements(currentRound)
        for (let i = 0; i < statements.length; i++) {
            const element = createStatementElement(statements[i], (statement, element) => {
                if (!element.classList.contains('selected')) {
                    selectedStatements.push(statement)
                    element.classList.add('selected')
                    if (currentRound === ROUND_COUNT - 1) {
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
            progressBar.innerHTML = `${currentRound + 1} / ${ROUND_COUNT}`
        }

    }

    setStatementsElements(0)

}
