import express from 'express'
import path from 'path'
import { OpenAI } from "@llamaindex/openai";
import { storageContextFromDefaults, VectorStoreIndex, Settings } from 'llamaindex';
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";

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
    topP: 0.02
})

async function getDocuments() {
    log(`Getting documents...`);
    const dataDir = 'data'
    const documents = await new SimpleDirectoryReader().loadData({ directoryPath: dataDir })
    return documents;
}

async function generateDatasource() {
    log(`Generating storage context...`);
    const persistDir = 'store';
    const storageContext = await storageContextFromDefaults({ persistDir })
    const documents = await getDocuments();
    log(`Creating vector store index...`);
    const index = await VectorStoreIndex.fromDocuments(documents, { storageContext, });
    return index
}

app.post('/api/chat', async (req, res) => {
    try {
        const userAgent = req.get('User-Agent')
        const url = req.originalUrl
        const ipAddress = req.ip
        log(`- request: ${JSON.stringify({ url, userAgent, ipAddress })}`)
        log('- input: ' + JSON.stringify(req.body))

        log('--- Generate datasource')
        const index = await generateDatasource()

        log('--- Init query engine...')
        const query_engine = index.asQueryEngine()

        log('--- Get response...')
        const start = Date.now()
        const response = await query_engine.query({ query: req.body.question })
        const end = Date.now()
        log(`--- Response (took ${(end - start) / 1000}s):\n${response.message.content}`)

        res.json({ answer: response.message.content, suggestions: [] })

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