import express from 'express'
import path from 'path'
import { OpenAI as OpenAILlama } from '@llamaindex/openai'
import { storageContextFromDefaults, VectorStoreIndex, Settings, ContextChatEngine } from 'llamaindex'
import { Conversation, createConversation } from './create_conversation'
import { generateSuggestions } from './generate_suggestions'
import { without } from 'lodash'

const app = express()
const PORT = 8080

export const log = (message: string, conversationId?: string, context?: any) => {
    let parts = without([
        new Date().toISOString(), 
        (conversationId !== undefined) ? conversationId.substring(0, 6) : undefined,
        message, 
        (context !== undefined) ? ` ${JSON.stringify(context)}` : undefined
    ], undefined)
    console.log(parts.join('   '))
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
    '/about': 'about.html',
    '/about.js': 'about.js',
    '/style.css': 'style.css',
    '/images/kd-1716250767.png': 'images/kd-1716250767.png',
    '/images/kesk-1715643393-2.png': 'images/kesk-1715643393-2.png',
    '/images/kok-1715642909.png': 'images/kok-1715642909.png',
    '/images/ps-1716251177.png': 'images/ps-1716251177.png',
    '/images/rkp-1715642415.png': 'images/rkp-1715642415.png',
    '/images/sdp-1715643055.png': 'images/sdp-1715643055.png',
    '/images/vas-1716252125-2.png': 'images/vas-1716252125-2.png',
    '/images/vihr-1716252407.png': 'images/vihr-1716252407.png',
    '/images/kd-logo.png': 'images/kd-logo.png',
    '/images/kesk-logo.png': 'images/kesk-logo.png',
    '/images/kok-logo.png': 'images/kok-logo.png',
    '/images/ps-logo.png': 'images/ps-logo.png',
    '/images/rkp-logo.png': 'images/rkp-logo.png',
    '/images/sdp-logo.png': 'images/sdp-logo.png',
    '/images/vas-logo.png': 'images/vas-logo.png',
    '/images/vihr-logo.png': 'images/vihr-logo.png',
}
for (const [urlPath, fileName] of Object.entries(staticFiles)) {
    app.get(urlPath, (_req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', fileName))
    })
}

Settings.llm = new OpenAILlama({
    model: 'gpt-4o-mini',
    temperature: 0.02,
    topP: 0.02,
    apiKey: process.env.OPENAI_API_KEY
})

async function generateDatasource(partyId: string): Promise<VectorStoreIndex> {
    const persistDir = `src/store_${partyId}`
    const storageContext = await storageContextFromDefaults({ persistDir })
    const index = await VectorStoreIndex.init({ storageContext })
    return index
}

const withoutLastParagraph = (text: string): string => {
    const linefeedPos = text.lastIndexOf('\n')
    if (linefeedPos !== -1) {
        return text.slice(0, linefeedPos).trim()
    } else {
        return text
    }
}

const conversations: Map<string, Conversation> = new Map()

app.post('/api/chat', async (req, res) => {
    try {
        const existingConversation = (req.body.conversationId !== undefined) ? conversations.get(req.body.conversationId) : undefined
        const conversation = existingConversation ?? createConversation(req.body.partyId)
        if (existingConversation === undefined) {
            const userAgent = req.get('User-Agent')
            const url = req.originalUrl
            const ipAddress = req.ip
            log('Start conversation', conversation.id, { url, userAgent, ipAddress })
            conversations.set(conversation.id, conversation)
        }
        conversation.messages.push({
            role: 'user',
            content: req.body.question
        })

        const index = await generateDatasource(req.body.partyId)
        const retriever = index.asRetriever()
        const chatEngine = new ContextChatEngine({ retriever })
        const stream = await chatEngine.chat({ message: req.body.question, stream: true, chatHistory: conversation.messages })
        
        log('Question', conversation.id, { question: req.body.question })
        const start = Date.now()
        let answerAndSuggestions = ''
        for await (const chunk of stream) {
            answerAndSuggestions += chunk.message.content.toString()
            process.stdout.write(chunk.message.content.toString());
        }
        const end = Date.now()
        log('Answer', conversation.id, { answer, elapsedTime: ((end - start) / 1000) })

        const answer = withoutLastParagraph(answerAndSuggestions)
        conversation.messages.push({
            role: 'assistant',
            content: answer
        })

        log('--- Generate suggestions')
        const suggestions = await generateSuggestions(answerAndSuggestions)
        const suggestions = await generateSuggestions(answer)
        log('Suggestions', conversation.id, suggestions)

        res.json({ answer: answer, conversationId: conversation.id, suggestions: suggestions })
    } catch (error: any) {
        log(`Error: ${error.message}`, undefined, { error })
        console.log(error)
        res.json({ error: 'Error' })
    }
})

app.post('/api/deleteConversation', async (req, _res) => {
    const success = conversations.delete(req.body.conversationId)
    if (success) {
        log(`Succesfully deleted conversation ${req.body.conversationId}`)
    } else {
        log(`Failed to delete conversation ${req.body.conversationId}`)
    }
})

app.get('/healthcheck', (_req, res) => {
    log('Healthcheck')
    res.send('OK')
})

app.listen(PORT, () => {
    log(`Server is running on http://localhost:${PORT}`)
})