import { createHtmlResponse, createHeadTag } from '../utils.js'

export const createResponse = async () => {
    const html = `
        <!DOCTYPE html>
        <html lang="fi">
        ${createHeadTag({
            additionalTags: [
                '<script src="https://static.kannatan.fi/lodash.min.js"></script>',
                '<script src="https://static.kannatan.fi/utils.js"></script>',
                '<script src="https://static.kannatan.fi/pages/pickStatements.js"></script>',
                '<script src="https://static.kannatan.fi/pages/compareStatements.js"></script>',
                '<script defer src="https://static.kannatan.fi/app.js"></script>'
            ]
        })}
        <body>
            <div id="root">
            </div>
            <div id="dialog">
            </div>
        </body>
        </html>
    `
    return createHtmlResponse(html)
}
