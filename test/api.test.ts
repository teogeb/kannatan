import { map, uniq } from 'lodash-es'
import { handler } from '../src/index.js'
import { PARTIES, Statement } from '../src/utils.js'
import { expect, runTests } from './utils.js'

const isStatement = (item: any) => {
    return Object.keys(item).sort().join() === 'id,level,partyId,phrase'
}

const apiRequest = async (path: string, postData = {}): Promise<any> => {
    const response = await handler({
        requestContext: {
            http: {
                path,
                method: 'POST'
            }
        },
        body: JSON.stringify({ sessionId: 'mock-session-id', ...postData })
    }, undefined as any, undefined as any)
    return JSON.parse(response.body)
}

const getStatementsTest = async () => {
    const body = await apiRequest('/api/statements')
    expect(body.statements.length, 50)
    for (const statement of body.statements) {
        expect(isStatement(statement), true)
    }
    const levels = uniq(map(body.statements, 'level'))
    expect(levels.length, 5)
    const partyIds = uniq(map(body.statements, 'partyId'))
    expect(partyIds.sort(), Object.keys(PARTIES).sort())
}

const pickStatementsTest = async () => {
    const body = await apiRequest('/api/statements/pick', {
        pickedStatementIds: ['vihr-3', 'vihr-4', 'lib-6', 'sdp-0', 'vihr-2', 'sdp-6', 'lib-6', 'vas-7', 'sdp-7', 'lib-0']
    })
    expect(body.topParties.join(), 'vihr,lib,sdp,vas')
    expect(body.compareStatements.length, 5)
    for (const compare of body.compareStatements) {
        expect(compare.length, 2)
        expect(isStatement(compare[0]), true)
        expect(isStatement(compare[1]), true)
        expect(compare[0].level, compare[1].level) 
        const parties = map(compare, 'partyId').join()
        expect((parties === 'vihr,lib') || (parties === 'lib,vihr'), true) 
    }
    const levels = uniq(body.compareStatements.map((compare: Statement[]) => compare[0].level))
    expect(levels.length, 5)
}

const compareStatementsTest = async () => {
    const body = await apiRequest('/api/statements/compare', {
        pickedStatementIds: ['vihr-3', 'vihr-4', 'lib-6', 'sdp-0', 'vihr-2', 'sdp-6', 'lib-6', 'vas-7', 'sdp-7', 'lib-0'],
        comparedStatementIds: ['lib-14', 'lib-9', 'vihr-12', 'vihr-13', 'lib-15']
    })
    expect(body.topParty, 'lib')
}

runTests([getStatementsTest, pickStatementsTest, compareStatementsTest])