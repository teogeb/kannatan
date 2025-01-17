import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getAnswer, createInitialPrompt, Message } from './openai'
import path from 'path'

const app = express()
const PORT = 8080

interface Dialogue {
    id: string
    messages: Message[]
}

const log = (message: string) => {
    console.log(new Date().toISOString() + '  ' + message)
}

const dialogues: Map<string, Dialogue> = new Map()

const createDialogue = (partyId: string, locationId: string): Dialogue => {
    const id = uuidv4()
    log(`- create dialogue: ${id}`)
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

const staticFiles = {
    '/': 'index.html',
    '/index.js': 'index.js',
    '/style.css': 'style.css'
}
for (const [urlPath, fileName] of Object.entries(staticFiles)) {
    app.get(urlPath, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', fileName))
    })    
}

app.post('/api/dialogue', async (req, res) => {
    try {
        log('Request')
        const userAgent = req.get('User-Agent')
        const url = req.originalUrl
        log(`- user agent: ${userAgent}, URL: ${url}`)
        log('- input: ' + JSON.stringify(req.body))
        const existingDialogue = (req.body.dialogueId !== undefined) ? dialogues.get(req.body.dialogueId) : undefined
        const dialogue = existingDialogue ?? createDialogue(req.body.partyId, req.body.locationId)
        dialogue.messages.push({
            role: 'user',
            content: req.body.question
        })
        const answer = await getAnswer(dialogue.messages)
        log('- answer: ' + answer)
        dialogue.messages.push({
            role: 'system',
            content: answer
        })
        dialogues.set(dialogue.id, dialogue)

        res.json({ answer, dialogueId: dialogue.id })
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