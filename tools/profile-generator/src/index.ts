import { OpenAI } from 'openai'
import { TextContentBlock } from 'openai/resources/beta/threads/messages'
import fs from 'fs/promises'
import fetch from 'node-fetch'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const PARTIES: Record<string, string> = {
    kd: 'Kristillisdemokraatit',
    kesk: 'Keskusta',
    kok: 'Kokoomus',
    lib: 'Liberaalipuolue',
    nyt: 'Liike Nyt',
    ps: 'Perussuomalaiset',
    rkp: 'RKP',
    sdp: 'SDP',
    vas: 'Vasemmistoliitto',
    vihr: 'Vihreät'
}

const partyId = process.argv[2]

const ASSISTANT_ID = 'asst_F4AKHftKwd4nDNwrTLHIafP1'
const QUESTIONS = [
    `Describe a scene where a person who admires the values Finnish party ${PARTIES[partyId]} is joyfully having good time in Finland. Describe the looks of the person and an action he/she might be doing.`,
    'Give a short 10 word sentence how that person would summarize some of his/her values in Finnish. Make the sentence personal.'
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
                console.log(`Answer: ${answer} \n\n`);
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
            image: imageResponse.data[0],
            questions: QUESTIONS
        }
        await fs.writeFile(`output/${fileId}.json`, JSON.stringify(profileDefinition, undefined, 4))

        const url = imageResponse.data[0].url!
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        await fs.writeFile(`output/${fileId}.png`, Buffer.from(await response.arrayBuffer()))

    } catch (error) {
        console.error(error);
    }
}

main()