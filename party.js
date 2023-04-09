const { PARTIES, getPartyStatements } = require('./utils')

const createHashtag = (partyId) => {
    return '#' + PARTIES[partyId].name.replace('&shy;', '').replace(' ', '').toLowerCase()
}

const createPartyPageHtml = async (partyId) => {
    const partyPlainName = PARTIES[partyId].name.replace('&shy;', '')
    const tweetText = `Minulle paras puolue on ${createHashtag(partyId)}.\n\n#kannatan #vaalikone`
    const statementElements = (await getPartyStatements(partyId)).map((statement) => `
        <div class="statement">
            <div class="speech-bubble">
                <p>${statement.phrase}</p>
            </div>
        </div>
    `)    
    return `
        <!DOCTYPE html>
        <html lang="fi">
        <head>
            <title>Kannatan vaalikone: ${partyPlainName}</title>
            <meta charset="UTF-8">
            <meta name="description" content="Vaalikoneen tulossivu: ${partyPlainName}, eduskuntavaalit 2023">
            <meta name="keywords" content="${partyPlainName.toLowerCase()}, vaalikone, eduskuntavaalit">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta property="og:title" content="Kannatan vaalikone: ${partyPlainName}">
            <meta property="og:image" content="https://kannatan.fi/static/vote-box-border.png?cache=tmp1">
            <meta property="og:image:type" content="image/png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="1200">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:site" content="@kannatan_">
            <meta name="twitter:title" content="Kannatan vaalikone: ${partyPlainName}">
            <meta name="twitter:image" content="https://kannatan.fi/static/vote-box-border.png?cache=tmp1">
            <link rel="stylesheet" href="/static/style.css">
            <script src="/static/lodash.min.js"></script>
            <script src="/static/utils.js"></script>
            <script defer src="/static/pages/party.js"></script>
            <link rel="icon" href="/static/favicon.svg">
            <link rel="preload" href="/static/KFOlCnqEu92Fr1MmYUtvAw.ttf" as="font">
            <link rel="preload" href="/static/4iCv6KVjbNBYlgoC1CzTtw.ttf" as="font">
            <link rel="preload" href="/static/4iCs6KVjbNBYlgo6eA.ttf" as="font">
        </head>
        <body>
            <div id="root">
                <img class="vote-box" src="/static/vote-box.svg" alt="Äänetyslaatikko" >
                <a class="twitter-button" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent('https://kannatan.fi/e/1/' + partyId)}" target="_blank">
                    <div>
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        <span>Twiittaa</span>
                    </div>
                </a>
                <div class="spacer"></div>
                <a href="/app"><div class="button">Tee uudestaan</div></a>
                <h1>${PARTIES[partyId].name}</h1>
                <div class="sub-header">kannattaa näitä asioita:</div>
                ${statementElements.join('')}
                <a href="/"><div class="button">Etusivulle</div></a>
            </div>
        </body>
        </html>
    `
}

module.exports = {
    createPartyPageHtml
}