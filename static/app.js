const main = async () => {

    const response = await apiRequest('/api/statements')
    sessionId = response.sessionId // TODO not ideal to have a global variable

    initPickStatementsPage(response.statements)

}

main()