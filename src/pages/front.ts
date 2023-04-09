import { createHtmlResponse, createSessionId, createUrlQueryParams } from '../utils.js'

export const createResponse = async () => {
    const html = `
        <!DOCTYPE html>
        <html lang="fi">
        <head>
            <title>Kannatan vaalikone</title>
            <meta charset="UTF-8">
            <meta name="description" content="Helppo vaalikone, eduskuntavaalit 2023">
            <meta name="keywords" content="kannatan, vaalikone, eduskuntavaalit, vaalit, puolue">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta property="og:title" content="kannatan.fi vaalikone">
            <meta property="og:image" content="https://static.kannatan.fi/vote-box-border.png">
            <meta property="og:image:type" content="image/png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="1200">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:site" content="@kannatan_">
            <meta name="twitter:title" content="Kannatan: Helppo vaalikone">
            <meta name="twitter:image" content="https://static.kannatan.fi/vote-box-border.png">
            <link rel="stylesheet" href="https://static.kannatan.fi/style.css">
            <link rel="icon" href="https://static.kannatan.fi/favicon.svg">
            <link rel="preload" href="https://static.kannatan.fi/KFOlCnqEu92Fr1MmYUtvAw.ttf" as="font" crossorigin>
            <link rel="preload" href="https://static.kannatan.fi/4iCv6KVjbNBYlgoC1CzTtw.ttf" as="font" crossorigin>
            <link rel="preload" href="https://static.kannatan.fi/4iCs6KVjbNBYlgo6eA.ttf" as="font" crossorigin>
            <link rel=“canonical” href="https://kannatan.fi/">
        </head>
        <body>
            <div id="root">
                <img class="vote-box" src="https://static.kannatan.fi/vote-box.svg" alt="Äänestyslaatikko">
                <h1>Helppo vaalikone</h1>
                <div class="sub-header">Valitse 10 + 5 asiaa, joita kannatat. Lauseet on poimittu puolueiden ohjelmista.</div>
                <a href="/app${createUrlQueryParams(createSessionId())}"><div class="button">Aloita</div></a>
                <a class="about" href="/about"><img src="https://static.kannatan.fi/question-mark.svg" alt="Kysymysmerkki"></a>
            </div>
        </body>
        </html>
    `
    return createHtmlResponse(html)
}
