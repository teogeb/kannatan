import { PARTIES, createHtmlResponse, createUrlQueryParams, getPartyStatements, createSessionId, createHeadTag } from '../utils.js'

const createHashtag = (partyId: string) => {
    return '#' + PARTIES[partyId].name.replace('&shy;', '').replace(' ', '').toLowerCase()
}

export const createResponse = async (pathParams: Record<string, string>) => {
    const partyId = pathParams.partyId
    const partyPlainName = PARTIES[partyId].name.replace('&shy;', '')
    const tweetText = `Minulle paras puolue on ${createHashtag(partyId)}.\n\n#kannatan #vaalikone`
    const statementElements = (await getPartyStatements(partyId)).map((statement) => `
        <div class="statement">
            <div class="speech-bubble">
                <p>${statement.phrase}</p>
            </div>
        </div>
    `)
    const title = 'Kannatan vaalikone: ' + partyPlainName
    const html = `
        <!DOCTYPE html>
        <html lang="fi">
        ${createHeadTag({
            pageTitle: title,
            socialMediaTitle: title,
            description: 'Vaalikoneen tulossivu: ' + partyPlainName + ', eduskuntavaalit 2023',
            keywords: partyPlainName.toLowerCase() + ', vaalikone, eduskuntavaalit',
            additionalTags: [
                '<script src="https://static.kannatan.fi/lodash.min.js"></script>',
                '<script src="https://static.kannatan.fi/utils.js"></script>',
                '<script defer src="https://static.kannatan.fi/pages/party.js"></script>',
                '<link rel="preload" href="https://static.kannatan.fi/KFOlCnqEu92Fr1MmYUtvAw.ttf" as="font" crossorigin>',
                '<link rel="preload" href="https://static.kannatan.fi/4iCv6KVjbNBYlgoC1CzTtw.ttf" as="font" crossorigin>',
                '<link rel="preload" href="https://static.kannatan.fi/4iCs6KVjbNBYlgo6eA.ttf" as="font" crossorigin>'
            ]
        })}
        <body>
            <div id="root">
                <img class="vote-box" src="https://static.kannatan.fi/vote-box.svg" alt="" >
                <a class="twitter-button" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://kannatan.fi/e/1/' + partyId)}" target="_blank">
                    <div>
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        <span>Twiittaa</span>
                    </div>
                </a>
                <div class="spacer"></div>
                <a href="/app${createUrlQueryParams(createSessionId())}"><div class="button">Tee uudestaan</div></a>
                <h1>${PARTIES[partyId].name}</h1>
                <div class="sub-header">kannattaa näitä asioita:</div>
                ${statementElements.join('')}
                <a href="/"><div class="button">Etusivulle</div></a>
            </div>
        </body>
        </html>
    `
    return createHtmlResponse(html)
}