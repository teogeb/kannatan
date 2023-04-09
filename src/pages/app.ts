import { createHtmlResponse } from '../utils.js'

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
            <meta property="og:title" content="kannatan.fi vaalikone" />
            <meta property="og:image" content="https://static.kannatan.fi/vote-box-border.png" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="1200" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@kannatan_" />
            <meta name="twitter:title" content="Kannatan" />
            <meta name="twitter:description" content="kannatan.fi vaalikone" />
            <meta name="twitter:image" content="https://static.kannatan.fi/vote-box-border.png" />
            <link rel="stylesheet" href="https://static.kannatan.fi/style.css">
            <script src="https://static.kannatan.fi/lodash.min.js"></script>
            <script src="https://static.kannatan.fi/utils.js"></script>
            <script src="https://static.kannatan.fi/pages/pickStatements.js"></script>
            <script src="https://static.kannatan.fi/pages/compareStatements.js"></script>
            <script defer src="https://static.kannatan.fi/app.js"></script>
            <link rel="icon" href="https://static.kannatan.fi/favicon.svg">
        </head>
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
