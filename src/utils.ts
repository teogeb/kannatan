import fs from 'fs/promises'
import { map, orderBy, random, range, shuffle, sum, uniq } from 'lodash-es'

export const STATEMENTS_PER_PARTY = 20

const HTTP_STATUS_OK = 200
export const HTTP_STATUS_NOT_FOUND = 404

export interface Statement {
    id: string
    phrase: string
    partyId: string
    level: number
}

export const PARTIES: Record<string, { name: string }> = {
    kd: { name: 'Kristillis&shy;demokraatit' },
    kesk: { name: 'Keskusta' },
    kok: { name: 'Kokoomus' },
    lib: { name: 'Liberaalipuolue' },
    nyt: { name: 'Liike Nyt' },
    ps: { name: 'Perus&shy;suomalaiset' },
    rkp: { name: 'RKP' },
    sdp: { name: 'SDP' },
    vas: { name: 'Vasemmisto&shy;liitto' },
    vihr: { name: 'Vihreät' }
}

export const getPartyStatements = async (partyId: string): Promise<Statement[]>=> {
    const file = await fs.readFile('./statements.json', 'utf-8')
    const json = JSON.parse(file) as Statement[]
    return json.filter((statement) => statement.partyId === partyId)
}

export const getAllStatements = async () => {
    const partyStatementArrays = await Promise.all(Object.keys(PARTIES).map((partyId) => {
        return getPartyStatements(partyId)
    }))
    const result = []
    for (let i = 0; i < STATEMENTS_PER_PARTY; i++) {
        const statements = shuffle(partyStatementArrays.map((statements) => statements[i]))
        result.push(...statements)
    }
    return result
}

const getStatementScore = (level: number) => {
    return 1 + (STATEMENTS_PER_PARTY - level) / STATEMENTS_PER_PARTY
}

export const getPartyIdAndLevel = (statementId: string) => {
    const [partyId, levelStr] = statementId.split('-')
    return {
        partyId,
        level: Number(levelStr)
    }
}

export const getPartyScores = (statementIds: string[]) => {
    const selections = statementIds.map((statementId) => getPartyIdAndLevel(statementId))
    const selectedParties = map(selections, 'partyId')
    return orderBy(uniq(selectedParties).map((partyId) => {
        return {
            partyId,
            score: sum(selections
                .filter((selection) => selection.partyId === partyId)
                .map((selection) => getStatementScore(selection.level))),
            minSelectionIndex: selectedParties.indexOf(partyId)
        }
    }), ['score', 'minSelectionIndex'], ['desc', 'asc'])
}

export const createRobotsTxtResponse = async () => {
    return createResponse('User-agent: *\nAllow: /\n\nSitemap: https://kannatan.fi/sitemap.xml\n', 'text/plain')
}

export const createSiteMapResponse = async () => {
    const deploymentMetadata = JSON.parse(await fs.readFile('./deployment.json', 'utf-8'))
    const pages: Record<string, number> = {
        '': 1.0,
        'about': 0.2
    }
    Object.keys(PARTIES).forEach((partyId: string) => {
        pages[`e/1/${partyId}`] = 0.5
    })
    const urls = Object.keys(pages).map((pageId: string) => {
        const priority = pages[pageId].toFixed(1)
        return `<url><loc>https://kannatan.fi/${pageId}</loc><lastmod>${deploymentMetadata.date}</lastmod><priority>${priority}</priority></url>`
    })
    const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
    return createResponse(body, 'application/xml')
}

export const createHtmlResponse = (html: string, statusCode = HTTP_STATUS_OK) => {
    return createResponse(html, 'text/html', statusCode)
}

export const createJsonResponse = (data: any, statusCode = HTTP_STATUS_OK) => {
    return createResponse(JSON.stringify(data), 'application/json', statusCode)
}

export const createResponse = (body: string, contentType: string, statusCode = HTTP_STATUS_OK) => {
    return {
        body,
        headers: {
            'Content-Type': contentType,
        },
        statusCode
    }
}

export const createSessionId = () => {
    const LENGTH = 6
    const HEX_DIGITS = 16
    return range(LENGTH).map(() => random(HEX_DIGITS - 1).toString(HEX_DIGITS)).join('')
}

export const createUrlQueryParams = (sessionId: string) => {
    return `?s=${sessionId}`
}

export const createHeadTag = (
    opts: { 
        pageTitle?: string,
        socialMediaTitle?: string,
        description?: string,
        keywords?: string,
        additionalTags?: string[]
        styleSheet?: string
    }
) => {
    const optsWithDefaults = {
        pageTitle: 'Kannatan vaalikone',
        socialMediaTitle: 'Kannatan: Helppo vaalikone',
        description: 'Helppo vaalikone, eduskuntavaalit 2023',
        keywords: 'kannatan, vaalikone, eduskuntavaalit, vaalit, puolue',
        additionalTags: [],
        styleSheet: 'https://static.kannatan.fi/style.css',
        ...opts
    }
    return `
        <head>
            <title>${optsWithDefaults.pageTitle}</title>
            <meta charset="UTF-8">
            <meta name="description" content="${optsWithDefaults.description}">
            <meta name="keywords" content="${optsWithDefaults.keywords}">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta property="og:title" content="${optsWithDefaults.socialMediaTitle}">
            <meta property="og:image" content="https://static.kannatan.fi/vote-box-border.png">
            <meta property="og:image:type" content="image/png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="1200">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:site" content="@kannatan_">
            <meta name="twitter:title" content="${optsWithDefaults.socialMediaTitle}">
            <meta name="twitter:image" content="https://static.kannatan.fi/vote-box-border.png">
            <link rel="stylesheet" href="${optsWithDefaults.styleSheet}">'
            <link rel="icon" href="https://static.kannatan.fi/favicon.svg">
            ${optsWithDefaults.additionalTags.join('\n')}
        </head>
    `
}
