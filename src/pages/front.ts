import { createHeadTag, createHtmlResponse, createSessionId, createUrlQueryParams } from '../utils.js'

export const createResponse = async () => {
    const html = `
        <!DOCTYPE html>
        <html lang="fi">
        ${createHeadTag({
            additionalTags: [
                '<link rel="preload" href="https://static.kannatan.fi/KFOlCnqEu92Fr1MmYUtvAw.ttf" as="font" crossorigin>',
                '<link rel="preload" href="https://static.kannatan.fi/4iCv6KVjbNBYlgoC1CzTtw.ttf" as="font" crossorigin>',
                '<link rel="preload" href="https://static.kannatan.fi/4iCs6KVjbNBYlgo6eA.ttf" as="font" crossorigin>',
                '<link rel="canonical" href="https://kannatan.fi/">'
            ]
        })}
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
