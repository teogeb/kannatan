import { createHeadTag, createHtmlResponse } from '../utils.js'

export const createResponse = async () => {
    const html = `
        <!DOCTYPE html>
        <html lang="fi">
        ${createHeadTag({
            additionalTags: [
                '<link rel="preload" href="https://static.kannatan.fi/KFOlCnqEu92Fr1MmYUtvAw.ttf" as="font" crossorigin>',
                '<link rel="preload" href="https://static.kannatan.fi/4iCv6KVjbNBYlgoC1CzTtw.ttf" as="font" crossorigin>',
                '<link rel="preload" href="https://static.kannatan.fi/4iCs6KVjbNBYlgo6eA.ttf" as="font" crossorigin>',
                '<script defer src="https://static.kannatan.fi/beta/index.js"></script>',
                '<meta name="robots" content="noindex">',
                '<link rel="canonical" href="https://kannatan.fi/beta">'
            ],
            styleSheet: 'https://static.kannatan.fi/beta/style.css'
        })}
        <body>
            <div id="root">
            </div>
        </body>
        </html>
    `
    return createHtmlResponse(html)
}
