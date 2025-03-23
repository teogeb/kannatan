import 'dotenv/config'

import { OpenAI as OpenAILlama } from '@llamaindex/openai'
import express from 'express'
import fs from 'fs'
import http from 'http'
import https from 'https'
import { Settings } from 'llamaindex'
import path from 'path'
import { createChatResponse, deleteConversation } from './chat'
import { sendMessageToTelegramAdminGroup } from './telegramBot'
import { listDirectoryPaths, log } from './utils'

const app = express()

Settings.llm = new OpenAILlama({
    model: 'gpt-4o-mini',
    temperature: 0.02,
    topP: 0.02,
    apiKey: process.env.OPENAI_API_KEY
})

app.use(express.json())
app.use((_req, res, next) => {
    res.set('Accept-CH', 'Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform')
    next()
})

app.use((req, res, next) => {
    if (req.url.includes('/images/') || req.url.includes('/fonts/') || req.url.includes('lodash.min.js')) {
        res.set('Cache-Control', 'public, max-age=86400')
    } else {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')
    }
    next()
})

const STATIC_FILES_ROOT = 'public'
const staticFiles = {
    '/': '/index.html',
    '/chat': '/chat.html',
    '/about': '/about.html',
    '/THIRD_PARTY_LICENSES.txt': '../THIRD_PARTY_LICENSES.txt',
    ...Object.fromEntries(listDirectoryPaths(STATIC_FILES_ROOT).map(item => [`/${item}`, item]))
}
for (const [urlPath, fileName] of Object.entries(staticFiles)) {
    app.get(urlPath, (_req, res) => {
        res.sendFile(path.join(__dirname, '..', STATIC_FILES_ROOT, fileName))
    })
}

app.post('/api/chat', async (req, res) => {
    const response = await createChatResponse(req)
    res.json(response)
})

app.post('/api/deleteConversation', async (req) => {
    deleteConversation(req)
})

app.post('/api/feedback', async (req, res) => {
    const userAgent = req.get('User-Agent')
    const ipAddress = req.ip
    const message = req.body.message
    log('Feedback message', undefined, { userAgent, ipAddress, message })
    await sendMessageToTelegramAdminGroup(message)
    res.json({
        status: 'success'
    })
})

if (process.env.HTTPS_DOMAIN !== undefined) {
    const domain = process.env.HTTPS_DOMAIN
    https.createServer({
        key: fs.readFileSync(process.env.HTTPS_KEY_PATH as string),
        cert: fs.readFileSync(process.env.HTTPS_CERT_PATH as string)
    }, app).listen(443, () => {
        console.log('HTTPS server running on port 443')
    })
    http.createServer((_req: http.IncomingMessage, res: http.ServerResponse) => {
        res.writeHead(301, { "Location": `https://${domain}` });
        res.end();
    }).listen(80, () => {
        console.log('HTTP server running on port 80 (Redirecting to HTTPS)')
    })
} else {
    const PORT = 8080
    app.listen(PORT, () => {
        log(`Server is running on http://localhost:${PORT}`)
    })
}
