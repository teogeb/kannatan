const MAX_SELECTION_COUNT = 10

const initPickStatementsPage = async () => {

    const createSelectionMarkerElement = (selectionCount) => {
        const element = document.createElement('div')
        element.innerHTML = `${selectionCount} / ${MAX_SELECTION_COUNT}`
        element.classList.add('selection-marker')
        return element
    }
    
    const showPageCompleteDialog = async (selectedStatements) => {
        const numberWords = ['', 'yhden', 'kahden', 'kolmen', 'neljän', 'viiden', 'kuuden', 'seitsemän', 'kahdeksan', 'yhdeksän', 'kymmenen']
        const pickResponse = await apiRequest('/api/statements/pick', {
            pickedStatementIds: _.map(selectedStatements, 'id')
        })
        const descriptionLines = pickResponse.topParties.map((p) => PARTIES[p].name)
        showDialog(
            `Kannatat ${numberWords[pickResponse.topParties.length]} puolueen ajamia asioita`,
            `${descriptionLines.join('<br/>')} <br/><br/> Valitaan niistä vielä paras sinulle!`,
            'Jatka',
            () => initCompareStatementsPage(pickResponse.compareStatements, selectedStatements)
        )
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
                    showPageCompleteDialog(selectedStatements)
                }
            } else {
                _.pull(selectedStatements, statement)
            }
        }
    }

    const selectableStatements = (await apiRequest('/api/statements')).statements
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