const main = async () => {

    const rootElement = document.getElementById('root')
    const observer = createStatementVisibilityObserver()
    const statementElements = rootElement.getElementsByClassName('statement')
    for (const statementElement of statementElements) {
        observer.observe(statementElement)
    }

}

main()

