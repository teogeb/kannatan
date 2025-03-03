import express from 'express'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { OpenAI } from "openai"
import { OpenAI as OpenAILlama } from "@llamaindex/openai"
import { storageContextFromDefaults, VectorStoreIndex, Settings, ContextChatEngine } from 'llamaindex'

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

const openai = new OpenAI()

Settings.llm = new OpenAILlama({
    model: 'gpt-4o-mini',
    temperature: 0.02,
    topP: 0.02,
    apiKey: process.env.OPENAI_API_KEY
})

async function generateDatasource(): Promise<VectorStoreIndex> {
    log(`Generating storage context...`)
    const persistDir = 'store'
    const storageContext = await storageContextFromDefaults({ persistDir })
    log(`Creating vector store index...`)
    const index = await VectorStoreIndex.init({ storageContext })
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
        
        log('--- Generate answer')
        const start = Date.now()
        let answer = ''
        for await (const chunk of stream) {
            answer += chunk.message.content.toString()
            process.stdout.write(chunk.message.content.toString());
        }
        const end = Date.now()
        console.log()
        log(`--- Answering took ${(end - start) / 1000}s`)

        conversation.messages.push({
            role: 'assistant',
            content: answer
        })
        conversations.set(conversation.id, conversation)

        log('--- Generate suggestions')
        const completion: OpenAI.ChatCompletion =  await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
            {role: 'user', content:`

                Poimi seuraavasta tekstistä enintään neljä olennaisinta ehdotusta, jotka liittyvät keskusteltavaan aiheeseen. Jos tekstissä ei ole selkeitä ehdotuksia, palauta tyhjä lista. Vastaa vain listana ilman selityksiä.
                Palauta vastaus täsmälleen seuraavassa muodossa: ["ehdotus1", "ehdotus2", "ehdotus3", "ehdotus4"].
                Ehdotuksia tulee olla maksimissaan neljä. Jokaisen ehdotuksen tulee olla vain maksimissaan kaksi sanaa. Jos olennaisia ehdotuksia on vähemmän kuin neljä, palauta vain ne.

                Tässä esimerkkejä teksteistä ja vastauksista:
                    • Teksti:
                    Kestävä talous on Vihreille tärkeä teema, jossa talouden tulee tukea ihmisten hyvinvointia ja sosiaalista oikeudenmukaisuutta. Tavoitteena on siirtyä kiertotalouteen, vähentää luonnonvarojen kulutusta ja edistää ekologisia investointeja. Vihreät haluavat myös tehdä verotuksesta reilumpaa ja torjua veronkiertoa. Miten tämä teema resonoi sinussa? Haluaisitko keskustella tarkemmin esimerkiksi kiertotaloudesta tai verouudistuksista?
                    • Vastaus:
                    ["Kiertotalous", "Verouudistukset"]

                    • Teksti:
                    Olet oikeassa! Varhaiskasvatus luo perustan arvoille, sosiaalisille taidoille ja oppimiselle. Se auttaa lapsia ymmärtämään yhteisön merkityksen ja vastuullisuuden. Haluaisitko keskustella lisää arvojen opettamisesta varhaiskasvatuksessa?
                    • Vastaus:
                    ["Haluan"]

                    • Teksti:
                    Vihreät haluavat palauttaa Suomen koulutuksen maailman parhaaksi. Tavoitteena on varmistaa laadukas varhaiskasvatus, perusopetus ja riittävä tuki koko koulutuspolun ajan. Koulutuksen rahoitus tulee nostaa muiden pohjoismaiden tasolle ja eriarvoistumista on ehkäistävä. Mitä mieltä olet koulutuksen rahoituksesta tai oppimiserojen kaventamisesta?
                    • Vastaus:
                    []

                    • Teksti:
                    Voimme keskustella monista aiheista, kuten ilmastonmuutoksesta, sosiaaliturvasta, koulutuksesta, tasa-arvosta tai kestävästä taloudesta. Mikä näistä kiinnostaa sinua eniten?
                    • Vastaus:
                    ["Ilmastonmuutos", "Sosiaaliturva", "Koulutus", "Tasa-arvo"]

                    • Teksti:
                    Vihreät edistävät tasa-arvoa ja yhdenvertaisuutta kaikilla elämänalueilla. Tavoitteena on purkaa eriarvoisuutta ja tukea erityisesti heikommassa asemassa olevia. Tasa-arvolain kokonaisuudistus ja palkkaohjelmat ovat keskeisiä toimenpiteitä. Mistä tarkemmin haluaisit keskustella tasa-arvon osalta? Voimme puhua esimerkiksi koulutuksesta, työelämästä tai sosiaalisista palveluista.
                    • Vastaus:
                    ["Koulutus", "Työelämä", "Sosiaaliset palvelut"]

                Luo vastaus seuraavalle tekstille:
                ${answer}`
            }],
        })

        let suggestions = [];
        try {
            suggestions = JSON.parse(completion.choices[0].message.content!)
        } catch (e: any) {
            log(`Could not parse text to list:\n${e.message}`)
        }
        log('--- suggestions: ' + suggestions)

        res.json({ answer: answer, conversationId: conversation.id, suggestions: suggestions })

    } catch (e: any) {
        log(e.message)
        console.log(e)
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