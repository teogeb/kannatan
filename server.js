const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const express = require('express')
const { map, first } = require('lodash')
const app = express()
const { log, getAllStatements, getPartyScores, createSiteMap, createSessionId } = require('./utils')
const { createPartyPageHtml } = require('./party')

app.use('/static/', express.static(__dirname + '/static', {
    setHeaders: function(res, path) {
        let expiration = 60 * 60
        if (path.endsWith('.js') || path.endsWith('.css')) {
            // could increase the time when the site is no longer under active development
            // TODO could adjust this so that lodash (and possibly other JS-libraries which
            // we add later) will also cache some non-zero time.
            expiration = 0
        }
        res.set('Cache-control', `public, max-age=${expiration}`)
    }
}))
app.use('/api', express.json())
app.use((req, _, next) => {
    try {
        const ipAddress = req.socket.remoteAddress
        log(`Request ${req.originalUrl} ipAddress=${ipAddress}, userAgent=${req.get('user-agent')}` + ((req.method === 'POST') ? ` body=${JSON.stringify(req.body)}` : ''))
    } catch (e) {
        // should not happen?
        log(`Unable to log: ${req.originalUrl}`)
    }
    next()
})
app.get('/api/statements', async (req, res) => {
    try {
        const statements = await getAllStatements()
        const sessionId = createSessionId(req.socket.remoteAddress)
        log(`Session ${sessionId}: ` + map(statements, 'id').join(','))
        res.json({
            statements,
            sessionId
        })
    } catch (e) {
        log('ERROR /api/statements')
        console.log(e)
        res.sendStatus(500)
    }
})
app.post('/api/statements/pick', async (req, res) => {
    try {
        const partyScores = getPartyScores(req.body.pickedStatementIds)
        res.json(map(partyScores, 'partyId'))
    } catch (e) {
        log('ERROR /api/statements/pick ' + JSON.stringify(req.body))
        console.log(e)
        res.sendStatus(500)
    }
})
app.post('/api/statements/compare', async (req, res) => {
    try {
        const partyScores = getPartyScores(req.body.comparedStatementIds.concat(req.body.pickedStatementIds))
        const topParty = first(partyScores).partyId
        res.json({
            topParty
        })
    } catch (e) {
        log('ERROR /api/statements/compare ' + JSON.stringify(req.body))
        console.log(e)
        res.sendStatus(500)
    }
})
app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
})
app.get('/app', function (_, res) {
    res.sendFile(path.join(__dirname, '/app.html'));
})
app.get('/e/1/:partyId', async (req, res) => {
    try {
        res.send(await createPartyPageHtml(req.params.partyId));
    } catch (e) {
        log('ERROR /e/1/:partyId ' + JSON.stringify(req.params))
        console.log(e)
        res.sendStatus(500)
    }
})
app.get('/about', function (_, res) {
    res.sendFile(path.join(__dirname, '/about.html'));
})
app.get('/robots.txt', function (_, res) {
    res.setHeader('content-type', 'text/plain')
    res.send('User-agent: *\nAllow: /\n\nSitemap: https://kannatan.fi/sitemap.xml\n')
})
app.get('/sitemap.xml', function (_, res) {
    res.setHeader('content-type', 'application/xml')
    res.send(createSiteMap())
})

if (process.env.DEVELOPMENT_ENVIRONMENT !== 'true') {
    const httpServerOpts = {
        key: fs.readFileSync('./ssl-certificate/privkey.pem'),
        cert: fs.readFileSync('./ssl-certificate/fullchain.pem')
    }
    https.createServer(httpServerOpts, app).listen(443, () => {
        log('Listening HTTPS...')
    })
    const redirectApp = express()
    redirectApp.get('/', function (_, res) {
        log('Redirect to HTTPS')
        res.redirect('https://kannatan.fi/');
    })
    http.createServer(redirectApp).listen(80, () => {
        log('Listening HTTP...')
    })
} else {
    http.createServer(app).listen(3000, () => {
        log('Listening HTTP...')
    })
}
