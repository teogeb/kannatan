const MAX_SELECTION_COUNT = 10
const SELECTABLE_LEVEL_COUNT = 5
const MAX_SELECTABLE_LEVEL = 9

const initPickStatementsPage = async (allStatements) => {

    const createSelectionMarkerElement = (selectionCount) => {
        const element = document.createElement('div')
        element.innerHTML = `${selectionCount} / ${MAX_SELECTION_COUNT}`
        element.classList.add('selection-marker')
        return element
    }
    
    const showPageCompleteDialog = async (selectedStatements, selectableLevels) => {
        const numberWords = ['', 'yhden', 'kahden', 'kolmen', 'neljän', 'viiden', 'kuuden', 'seitsemän', 'kahdeksan', 'yhdeksän', 'kymmenen']
        const partyIds = await apiRequest('/api/statements/pick', {
            pickedStatementIds: _.map(selectedStatements, 'id'),
            selectableLevels: selectableLevels
        })
        const descriptionLines = partyIds.map((p) => PARTIES[p].name)
        if (descriptionLines > 3) {
            descriptionLines = ['Kolmen kärki:'].concat(_.slice(descriptionLines, 0, 3))
        }
        if (partyIds.length >= 2) {
            showDialog(
                `Kannatat ${numberWords[partyIds.length]} puolueen ajamia asioita`,
                `${descriptionLines.join('<br/>')} <br/><br/> Valitaan niistä vielä paras sinulle!`,
                'Jatka',
                () => initCompareStatementsPage(allStatements, selectedStatements, partyIds.slice(0, 2))
            )
        } else {
            const topParty = partyIds[0]
            showDialog(
                `Sinulle paras puolue on`,
                `${PARTIES[topParty].name}`,
                'Selvä!',
                () => window.location.href = `/e/1/${topParty}`
            )
        }
    }
    
    const rootElement = document.getElementById('root')
    rootElement.innerHTML = `
        <h1>Kannatatko?</h1>
        <div class="sub-header">Valitse 10 lausetta.</div>
        <div id="scroll-hint">
            &#x2193;
        </div>`

    const selectedStatements = []
    const onStatementClick = (statement, element) => {
        if (selectedStatements.length < MAX_SELECTION_COUNT) {
            element.classList.toggle('selected')
            if (element.classList.contains('selected')) {
                selectedStatements.push(statement)
                element.appendChild(createSelectionMarkerElement(selectedStatements.length))
                if (selectedStatements.length === MAX_SELECTION_COUNT) {
                    showPageCompleteDialog(selectedStatements, selectableLevels)
                }
            } else {
                _.pull(selectedStatements, statement)
            }
        }
    }

    const selectableLevels = [0].concat(_.sampleSize(_.range(1, MAX_SELECTABLE_LEVEL + 1), SELECTABLE_LEVEL_COUNT - 1).sort())
    const selectableStatements = allStatements.filter((s) => selectableLevels.includes(s.level))
    const observer = createStatementVisibilityObserver()
    for (let i = 0; i < selectableStatements.length; i++) {
        const element = createStatementElement(selectableStatements[i], onStatementClick)
        rootElement.appendChild(element)
        observer.observe(element)
    }
    
    const scrollHint = document.getElementById('scroll-hint')
    const showScrollHintTimer = setTimeout(() => {
        scrollHint.classList.add('visible')
    }, 10000)
    window.addEventListener('scroll', () => {
        if ((window.scrollY / window.innerHeight) > 0.05) {
            clearTimeout(showScrollHintTimer)
            if (scrollHint.classList.contains('visible')) {
                scrollHint.classList.remove('visible')
            }
        }
    })

}