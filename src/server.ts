import 'dotenv/config'

import { OpenAI as OpenAILlama } from '@llamaindex/openai'
import express from 'express'
import { Settings } from 'llamaindex'
import path from 'path'
import { sendMessageToTelegramAdminGroup } from './telegramBot'
import { listDirectoryPaths, log } from './utils'
import { createChatResponse, deleteConversation } from './chat'

const app = express()
const PORT = 8080

Settings.llm = new OpenAILlama({
    model: 'gpt-4o-mini',
    temperature: 0.02,
    topP: 0.02,
    apiKey: process.env.OPENAI_API_KEY
})

// this is needed to get client IP address as deployment is behind a proxy (the AWS Application Load Balancer)
app.set('trust proxy', true)

app.use(express.json())
app.use((_req, res, next) => {
    res.set('Accept-CH', 'Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform')
    // TODO not needed in production:
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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

app.get('/healthcheck', (_req, res) => {
    log('Healthcheck')
    res.send('OK')
})

app.listen(PORT, () => {
    log(`Server is running on http://localhost:${PORT}`)
})