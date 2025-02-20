import express from 'express'
import path from 'path'
import { OpenAI } from 'openai'

const app = express()
const PORT = 8080

export const openai = new OpenAI()

const log = (message: string) => {
    console.log(new Date().toISOString() + '  ' + message)
}

const createThread = async (partyId: string) => {
    const thread = await openai.beta.threads.create()
    log(`💬 Created thread: ${thread.id}`)
    return thread.id
}

// this is needed to get client IP address as deployment is behind a proxy (the AWS Application Load Balancer)
app.set('trust proxy', true)

app.use(express.json())
app.use((_req, res, next) => {  // TODO not needed in production
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use((req, res, next) => {
    if (req.url.includes('/images/')) {
        res.set('Cache-Control', 'public, max-age=86400')
    } else {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')
    }
    next()
})

const staticFiles = {
    '/': 'index.html',
    '/index.js': 'index.js',
    '/chat': 'chat.html',
    '/chat.js': 'chat.js',
    '/style.css': 'style.css',
    '/images/kd-1716250767.png': 'kd-1716250767.png',
    '/images/kesk-1715643393-2.png': 'kesk-1715643393-2.png',
    '/images/kok-1715642909.png': 'kok-1715642909.png',
    '/images/ps-1716251177.png': 'ps-1716251177.png',
    '/images/rkp-1715642415.png': 'rkp-1715642415.png',
    '/images/sdp-1715643055.png': 'sdp-1715643055.png',
    '/images/vas-1716252125-2.png': 'vas-1716252125-2.png',
    '/images/vihr-1716252407.png': 'vihr-1716252407.png'
}
for (const [urlPath, fileName] of Object.entries(staticFiles)) {
    app.get(urlPath, (_req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', fileName))
    })    
}

app.post('/api/chat', async (req, res) => {
    try {
        const userAgent = req.get('User-Agent')
        const url = req.originalUrl
        const ipAddress = req.ip
        log(`- request: ${JSON.stringify({ url, userAgent, ipAddress })}`)
        log('- input: ' + JSON.stringify(req.body))

        const threadId = await (req.body.threadId ?? createThread(req.body.partyId))

        await openai.beta.threads.messages.create(
            threadId,
            {
                role: 'user',
                content: req.body.question
            }
        )

        // Run assistant
        console.log('⏳ Running assistant...')
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: 'asst_X5sEJ23Ge9x2IP0GYmrsqZE0' // Vihreä puolue
        })

        // Poll for completion
        let runStatus
        do {
            await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 sec
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
            console.log(`🔄 Assistant is processing... (Status: ${runStatus.status})`)
        } while (runStatus.status !== 'completed')

        const removeSourceReferences = (text: string) => text.replace(/\u3010\d+:\d+\u2020source\u3011/g, '')
        
        // Fetch the assistant's response
        const messages = await openai.beta.threads.messages.list(threadId)
        const lastMessage = messages.data.find(msg => msg.role === 'assistant')?.content?.find(c => 'text' in c)?.text?.value || 'No response received.'
        const cleanedMessage = removeSourceReferences(lastMessage);

        console.log('\n📄 *OpenAI Summary:*\n')
        console.log(`Last Message:\n${lastMessage}\n`)
        console.log(`Cleaned Message:\n${cleanedMessage}\n`)

        res.json({ answer: cleanedMessage, threadId: threadId })

    } catch (e: any) {
        log(e.message)
        console.log(e)
        res.json({ error: 'Error' })
    }
})
app.post('/api/deleteThread', async (req, res) => {
    try {
        console.log(`🪡 Deleting thread ${req.body.threadId}...`)
        const response = await openai.beta.threads.del(req.body.threadId)
        console.log(response)
    } catch (e: any) {
        log(e.message)
        console.log(e)
        res.json({ error: 'Error' })
    }
})

app.get('/healthcheck', (_req, res) => {
    log('Healthcheck')
    res.send('OK')
})

app.listen(PORT, () => {
    log(`Server is running on http://localhost:${PORT}`)
})