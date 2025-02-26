import express from 'express'
import path from 'path'
import { OpenAI } from 'openai'

const app = express()
const PORT = 8080

export const openai = new OpenAI()

const log = (message: string) => {
    console.log(new Date().toISOString() + '  ' + message)
}

const createThread = async () => {
    const thread = await openai.beta.threads.create()
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

// Initialized with test assistant asst...qZE0 (Vihreät - Reilun vihreän muutoksen ohjelma).
// Update assistant IDs with respective party assistants.
const assistantIds: Record<string, string> = {
    kd:   'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    kesk: 'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    kok:  'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    ps:   'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    rkp:  'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    sdp:  'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    vas:  'asst_X5sEJ23Ge9x2IP0GYmrsqZE0',
    vihr: 'asst_VwkrL1zu31gzwuqT7ybj2v5n'
}

const removeSourceReferences = (plainAnswer: string) => plainAnswer.replace(/\u3010\d+:\d+\u2020source\u3011/g, '')

app.post('/api/chat', async (req, res) => {
    try {
        const userAgent = req.get('User-Agent')
        const url = req.originalUrl
        const ipAddress = req.ip
        log(`- request: ${JSON.stringify({ url, userAgent, ipAddress })}`)
        log('- input: ' + JSON.stringify(req.body))

        log('--- create thread')
        const threadId = await (req.body.threadId ?? createThread())
        log('--- create message')
        await openai.beta.threads.messages.create(
            threadId,
            {
                role: 'user',
                content: req.body.question
            }
        )
        log('--- run assistant')
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantIds[req.body.partyId],
            tool_choice: 'auto',
            tools: [{ type: 'file_search' }],
            stream: true
        })

        let plainAnswer = ''
        for await (const event of run) {
            if (event.event === 'thread.message.delta') {
                const delta = event.data.delta as any
                const snippet = delta.content[0].text.value
                plainAnswer += snippet
                log('--- receive snippet: ' + snippet.length)
            }
        }
        log('--- plainAnswer: ' + plainAnswer)


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
                ${removeSourceReferences(plainAnswer)}`
            }],
        })

        let suggestions = [];
        try {
            suggestions = JSON.parse(completion.choices[0].message.content!)
        } catch (e: any) {
            log(`Could not parse text to list:\n${e.message}`)
        }
        log('--- suggestions: ' + suggestions)

        res.json({ answer: removeSourceReferences(plainAnswer), suggestions: suggestions, threadId: threadId })

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