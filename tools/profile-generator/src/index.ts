import { OpenAI } from 'openai'
import { TextContentBlock } from 'openai/resources/beta/threads/messages'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import sharp from 'sharp'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const PARTIES: Record<string, { nominative: string, partitive: string }> = {
    kd: { nominative: 'Kristillisdemokraatit', partitive: 'Kristillisdemokraatteja' },
    kesk: { nominative: 'Keskusta', partitive: 'Keskustaa' },
    kok: { nominative: 'Kokoomus', partitive: 'Kokoomusta' },
    lib: { nominative: 'Liberaalipuolue', partitive: 'Liberaalipuoluetta' },
    nyt: { nominative: 'Liike Nyt', partitive: 'Liike Nyt -puoluetta' },
    ps: { nominative: 'Perussuomalaiset', partitive: 'Perussuomalaisia' },
    rkp: { nominative: 'RKP', partitive: 'RKP:tä' },
    sdp: { nominative: 'SDP', partitive: 'SDP:tä' },
    vas: { nominative: 'Vasemmistoliitto', partitive: 'Vasemmistoliittoa' },
    vihr: { nominative: 'Vihreät', partitive: 'Vihreitä' }
  }

const partyId = process.argv[2]

const ASSISTANT_ID = 'asst_F4AKHftKwd4nDNwrTLHIafP1'
const QUESTIONS = [
    `Describe a scene where a person who admires the values Finnish party ${PARTIES[partyId].nominative} is joyfully having good time in Finland. Describe the looks of the person and an action he/she might be doing.`,
    'Give a short 10 word sentence how that person would summarize some of his/her values in Finnish. Make the sentence personal.',
    `Kerro kahden lauseen perustelu, miksi tämä henkilö voisi äänestää ${PARTIES[partyId].partitive}. Kerro perustelu minä-muotoisina lauseina.`
]

async function main() {
    let answers = []
    try {
        const thread = await openai.beta.threads.create()
        for (const question of QUESTIONS) {
            console.log('Asking question')
            await openai.beta.threads.messages.create(thread.id, {
                role: 'user',
                content: question,
            })
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: ASSISTANT_ID
            })
            while (true) {
                console.log('Waiting response...')
                await new Promise((resolve) => setTimeout(resolve, 2000))
                const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
                if (runStatus.status === 'completed') {
                    break
                }
            }
            const messages = await openai.beta.threads.messages.list(thread.id)
            const lastMessageForRun = messages.data
                .filter((message) => message.run_id === run.id && message.role === 'assistant')
                .pop()
            if (lastMessageForRun) {
                const answer = (lastMessageForRun.content[0] as TextContentBlock).text.value
                console.log(`Answer: ${answer} \n\n`)
                answers.push(answer)
            } else {
                console.log('ERROR')
            }
        }

        console.log('Generating image')
        const IMAGE_PROMPT = `
            A simple black-and-white pencil sketch. The feeling in the image is cozy and happy.
            Person of in the picture is a citizen of Finland. The person looks towards the camera.
            ${answers[0]}
        `
        const imageResponse = await openai.images.generate({ 
            prompt: IMAGE_PROMPT,
            model: 'dall-e-3', 
            size: '1024x1024',
        })

        console.log(JSON.stringify(imageResponse))

        const fileId = `${partyId}-${imageResponse.created}`
        const profileDefinition = {
            party: partyId,
            created: imageResponse.created,
            scene: answers[0],
            statement: answers[1],
            reason: answers[2],
            image: imageResponse.data[0],
            questions: QUESTIONS
        }
        await fs.writeFile(`output/${fileId}.json`, JSON.stringify(profileDefinition, undefined, 4))

        console.log('Fetch image')
        const url = imageResponse.data[0].url!
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const origFileName = `output/${fileId}-orig.png`
        await fs.writeFile(origFileName, Buffer.from(await response.arrayBuffer()))

        const greyscaleFileName = `output/${fileId}-greyscale.png`
        console.log('Convert to greyscale')
        await sharp(origFileName).greyscale().toFile(greyscaleFileName)

        console.log('Profile image: ' + greyscaleFileName)

    } catch (error) {
        console.error(error);
    }
}

main()