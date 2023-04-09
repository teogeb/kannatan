const fsPromises = require('fs/promises')
const crypto = require('crypto')
const _ = require('lodash')

const PARTIES = {
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

const STATEMENTS_PER_PARTY = 20

const log = (msg) => {
    console.log(`${new Date().toISOString()}   ${msg}`)
}

const getPartyStatements = async (partyId) => {
    const COMMENT_PREFIX = '#'
    const file = await fsPromises.readFile(`phrases/${partyId}.md`, 'utf-8')
    const lines = file.split('\n')
    return lines
        .filter((line) => !line.startsWith(COMMENT_PREFIX))
        .map((line, lineIndex) => ({
            id: `${partyId}-${lineIndex}`, // NOTE: (possible TODO) if we change content in files, e.g. reorder lines, this id changes...
            phrase: line,
            partyId: partyId,
            level: lineIndex
        }))
}

const getAllStatements = async () => {
    const partyStatementArrays = await Promise.all(Object.keys(PARTIES).map((partyId) => {
        return getPartyStatements(partyId)
    }))
    const result = []
    for (let i = 0; i < STATEMENTS_PER_PARTY; i++) {
        const statements = _.shuffle(partyStatementArrays.map((statements) => statements[i]))
        result.push(...statements)
    }
    return result
}

const getStatementScore = (level) => {
    return 1 + (STATEMENTS_PER_PARTY - level) / STATEMENTS_PER_PARTY
}

const getPartyScores = (statementIds) => {
    const selections = statementIds.map((statementId) => {
        const [partyId, levelStr] = statementId.split('-')
        return {
            partyId,
            level: Number(levelStr)
        }
    })
    const selectedParties = _.map(selections, 'partyId')
    return _.orderBy(_.uniq(selectedParties).map((partyId) => {
        return {
            partyId,
            score: _.sum(selections
                .filter((selection) => selection.partyId === partyId)
                .map((selection) => getStatementScore(selection.level))),
            minSelectionIndex: selectedParties.indexOf(partyId)
        }
    }), ['score', 'minSelectionIndex'], ['desc', 'asc'])
}

const createSiteMap = () => {
    const lastModified = '2023-03-26T18:00:00+00:00'
    const pages = {
        '': 1.0,
        'about': 0.2
    }
    Object.keys(PARTIES).forEach((partyId) => {
        pages[`e/1/${partyId}`] = 0.5
    })
    const urls = Object.keys(pages).map(pageId => {
        const priority = pages[pageId].toFixed(1)
        return `<url><loc>https://kannatan.fi/${pageId}</loc><lastmod>${lastModified}</lastmod><priority>${priority}</priority></url>`
    })
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
}

const createSessionId = (ipAddress) => {
    const hash = crypto.createHash('md5').update(`kannatan-salt-${ipAddress}`).digest("hex")
    const timestamp = Date.now().toString(16)
    return hash + timestamp
}

module.exports = {
    PARTIES,
    log,
    getPartyStatements,
    getAllStatements,
    getPartyScores,
    createSiteMap,
    createSessionId
}