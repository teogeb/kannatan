import { first, map, max, range, sampleSize } from 'lodash-es'
import { createJsonResponse, getAllStatements, getPartyIdAndLevel, getPartyScores, STATEMENTS_PER_PARTY } from './utils.js'

const ENDPOINTS: Record<string, (requestBody: any, sessionId: string | undefined) => Promise<any>> = {
    'statements': async (_postData: any, sessionId: string | undefined) => {
        const SELECTABLE_LEVEL_COUNT = 5
        const MAX_SELECTABLE_LEVEL = 9
        const allStatements = await getAllStatements()
        const selectableLevels = [0].concat(sampleSize(range(1, MAX_SELECTABLE_LEVEL + 1), SELECTABLE_LEVEL_COUNT - 1).sort())
        const statements = allStatements.filter((s) => selectableLevels.includes(s.level))
        console.log(`Statements: sessionId=${sessionId} ${statements.map((s) => s.id).join(',')}`)
        return {
            statements
        }
    },
    'statements/pick': async (postData: any) => {
        const COMPARE_STATEMENTS_ROUND_COUNT = 5
        const pickedStatementIds: string[] = postData.pickedStatementIds
        const pickedLevels = pickedStatementIds.map((statementId) => getPartyIdAndLevel(statementId).level)
        const partyScores = getPartyScores(pickedStatementIds)
        const topParties = map(partyScores, 'partyId')
        const compareParties = topParties.slice(0, 2)
        const allStatements = await getAllStatements()
        const minPreferredLevel = max(pickedLevels)! + 1
        const levels = sampleSize(range(minPreferredLevel, STATEMENTS_PER_PARTY), COMPARE_STATEMENTS_ROUND_COUNT)
        const compareStatements = levels.map((level) => {
            const levelStatements = allStatements.filter((s) => s.level === level)
            return levelStatements.filter((s) => compareParties.includes(s.partyId))
        })
        return {
            topParties,
            compareStatements
        }
    },
    'statements/compare': async (postData: any) => {
        const partyScores = getPartyScores(postData.comparedStatementIds.concat(postData.pickedStatementIds))
        return {
            topParty: first(partyScores)!.partyId
        }
    }
}

export const createApiResponse = async (pathParams: Record<string,string>, sessionId: string | undefined, postData: any | undefined) => {
    const endpoint = pathParams.endpoint
    const responseData = await ENDPOINTS[endpoint](postData, sessionId)
    return createJsonResponse(responseData)
}