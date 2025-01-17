import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getAnswer, createInitialPrompt, Message } from './openai'
import path from 'path'

const app = express()
const PORT = 8080

interface Session {
    id: string
    messages: Message[]
}

const log = (message: string) => {
    console.log(new Date().toISOString() + '  ' + message)
}

const sessions: Map<string, Session> = new Map()

const createSession = (partyId: string, locationId: string): Session => {
    const id = uuidv4()
    log(`- create session: ${id}`)
    return {
        id,
        messages: [
            { 
                role: 'system', 
                content: createInitialPrompt(partyId, locationId)
            }
        ]
    }
}

app.use(express.json())
app.use((req, res, next) => {  // TODO not needed in production
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    next()
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

app.post('/api', async (req, res) => {
    try {
        log('Request')
        const userAgent = req.get('User-Agent')
        const url = req.originalUrl
        log(`- user agent: ${userAgent}, URL: ${url}`)
        log('- input: ' + JSON.stringify(req.body))
        const existingSession = (req.body.sessionId !== undefined) ? sessions.get(req.body.sessionId) : undefined
        const session = existingSession ?? createSession(req.body.partyId, req.body.locationId)
        session.messages.push({
            role: 'user',
            content: req.body.question
        })
        const answer = await getAnswer(session.messages)
        log('- answer: ' + answer)
        session.messages.push({
            role: 'system',
            content: answer
        })
        sessions.set(session.id, session)

        res.json({ answer, sessionId: session.id })
    } catch (e: any) {
        log(e.message)
        console.log(e)
        res.json({ error: 'Error' })
    }
})
app.get('/healthcheck', (req, res) => {
    log('Healthcheck')
    res.send('OK')
})

app.listen(PORT, () => {
    log(`Server is running on http://localhost:${PORT}`)
})