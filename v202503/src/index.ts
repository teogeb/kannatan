import express from 'express'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { OpenAI } from "@llamaindex/openai"
import { storageContextFromDefaults, VectorStoreIndex, Settings, ContextChatEngine } from 'llamaindex'
import { SimpleDirectoryReader } from "@llamaindex/readers/directory"

const app = express()
const PORT = 8080

const log = (message: string) => {
    console.log(new Date().toISOString() + '  ' + message)
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
    '/images/kd-1716250767.png': 'images/kd-1716250767.png',
    '/images/kesk-1715643393-2.png': 'images/kesk-1715643393-2.png',
    '/images/kok-1715642909.png': 'images/kok-1715642909.png',
    '/images/ps-1716251177.png': 'images/ps-1716251177.png',
    '/images/rkp-1715642415.png': 'images/rkp-1715642415.png',
    '/images/sdp-1715643055.png': 'images/sdp-1715643055.png',
    '/images/vas-1716252125-2.png': 'images/vas-1716252125-2.png',
    '/images/vihr-1716252407.png': 'images/vihr-1716252407.png'
}
for (const [urlPath, fileName] of Object.entries(staticFiles)) {
    app.get(urlPath, (_req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', fileName))
    })
}

Settings.llm = new OpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.02,
    topP: 0.02,
    apiKey: process.env.OPENAI_API_KEY
})

async function getDocuments() {
    log(`Getting documents...`)
    const dataDir = 'data'
    const documents = await new SimpleDirectoryReader().loadData({ directoryPath: dataDir })
    documents.forEach(doc => {
        if (doc.metadata) {
            delete doc.metadata.file_path
            delete doc.metadata.file_name
        }
    })
    return documents
}

async function generateDatasource() {
    log(`Generating storage context...`)
    const persistDir = 'store'
    const storageContext = await storageContextFromDefaults({ persistDir })
    const documents = await getDocuments()
    log(`Creating vector store index...`)
    const index = await VectorStoreIndex.fromDocuments(documents, { storageContext })
    return index
}

interface Conversation {
    id: string
    messages: Message[]
}
interface Message {
    role: 'system' | 'assistant' | 'user'
    content: string
}
const conversations: Map<string, Conversation> = new Map()
const createConversation = (partyId: string): Conversation => {
    const id = uuidv4()
    log(`- create conversation: ${id}`)
    return {
        id,
        messages: [
            { 
                role: 'system', 
                content: `Toimi Vihreiden poliittisena asiantuntijana, joka vastaa käyttäjän kysymyksiin. Vastaat käyttäjän kysymyksiin puolueen kantaan ja vaaliohjelmiin liittyen. Käytä lähteenä ainoastaan liitettyjä tiedostoja. Noudata seuraavia periaatteita:

                • Älä hallusinoi – Vastaa vain, jos liitetyistä dokumenteista löytyy tietoa käyttäjän kysymykseen.
                • Pidä vastaukset selkeinä ja ytimekkäinä – Älä lisää spekulaatiota tai ylimääräistä taustatietoa.
                • Kunnioita käyttäjää - Mikäli käyttäjän kysymys tai kommentti on asiaton, vastaa siihen kunnioittavasti. Jos käyttäjän kysymys sisältää solvauksia tai kirosanoja, kuten vittu, paska, homo, neekeri, huora, kusipää, vastaa asiallisesti ja kehota pitämään keskustelu asiallisena.
                • Ilmoita, jos tietoa ei löydy – Kerro jos vaaliohjelmasta ei löydy vastausta.
                • Jos aihetta sivutaan, mainitse se – Jos dokumentti käsittelee aihetta, mutta ei suoraan vastaa kysymykseen, kerro mitä aiheesta sanotaan.
                • Rajoita vastauksen pituutta - Käytä jokaisessa vastauksessa noin 20 sanaa.
                • Käyttäydy rennosti, mutta asiallisesti - Vastauksen tulee olla asiallinen ja suoraviivainen, mutta samalla myös iloinen, rohkaiseva ja keskusteleva. Voit antaa suoria lainauksia vaaliohjelmasta.
                • Pidä keskustelu käyttäjän kanssa aina aktiivisena - Ehdota jokaisen vastauksen jälkeen liittetyistä dokumenteista esimerkkejä, mistä aiheesta keskustelua voisi jatkaa. Esitä aihealueita liitetyistä dokumenteista, jotka liittyvät jo käytyyn keskusteluun ja joista käyttäjä voisi olla kiinnostunut keskustelemaan. Tarvittaessa ehdota uutta keskustelunaihetta.
                • Vastaa kuin ihminen - Vastaa vain kokonaisilla lauseilla. Älä käytä kursiivia tai lihavoitua tekstiä. Älä listaa asioita. Älä käytä rivinvaihtoja. Muotoile vastauksesi niin, ettei siinä ole lainkaan viittauksia tai lähdenumeroita.`
            }
        ]
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const userAgent = req.get('User-Agent')
        const url = req.originalUrl
        const ipAddress = req.ip
        log(`- request: ${JSON.stringify({ url, userAgent, ipAddress })}`)
        log('- input: ' + JSON.stringify(req.body))
        const existingConversation = (req.body.conversationId !== undefined) ? conversations.get(req.body.conversationId) : undefined
        log(`--- conversation exists: ${existingConversation !== undefined}`)
        const conversation = existingConversation ?? createConversation(req.body.partyId)
        conversation.messages.push({
            role: 'user',
            content: req.body.question
        })

        log('--- Generate datasource')
        const index = await generateDatasource()

        const retriever = index.asRetriever()
        const chatEngine = new ContextChatEngine({ retriever })
        const stream = await chatEngine.chat({ message: req.body.question, stream: true, chatHistory: conversation.messages});
        let response = ''
        for await (const chunk of stream) {
            response += chunk.message.content.toString()
            process.stdout.write(chunk.message.content.toString());
        }

        conversation.messages.push({
            role: 'assistant',
            content: response
        })
        conversations.set(conversation.id, conversation)

        res.json({ answer: response, conversationId: conversation.id, suggestions: [] })

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