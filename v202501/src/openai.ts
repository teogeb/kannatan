import { OpenAI } from 'openai';

export const createInitialPrompt = (partyId: string) => {
    const partyGenetives: Record<string, any> = {
        kd: 'Kristillisdemokraattien',
        kesk: 'Keskustan',
        kok: 'Kokoomuksen',
        ps: 'Perussuomalaisten',
        rkp: 'Ruotsalaisen kansanpuolueen',
        sdp: 'Suomen sosialidemokraattisen puoleen',
        vas: 'Vasemmistoliiton',
        vihr: 'Vihreät r.p.:n'
    }
    return `
    Olet suomalainen ${partyGenetives[partyId]} poliitikko. Sinulta voi kysyä poliittisia näkemyksiä. Sinun näkemyksesi vastaavat puolueen linjaa stereotyyppisesti. Vastaat kysymyksiin noin 20 sanalla ja helposti ymmärrettävällä kielellä. Vältät vastauksissa liian tarkkoja yksityiskohtia. Vastaa minämuodossa. Jos aiheeseen liittyy kaupunki- tai kuntatason asioita, käsittele vastauksessasi myös niitä.

    Anna sellainen vastaus, joka on enemmän ${partyGenetives[partyId]} mukainen kuin muoden suomalaisten puolueiden mukainen. Älä vastaa sellaisia asioita, jotka kaikki poliitikot kannattavat.
    `
}

export interface Message {
    role: 'system' | 'assistant' | 'user'
    content: string
}

const openai = new OpenAI()

export const getAnswer = async (messages: Message[]) => {
    const completion: OpenAI.ChatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages
    })
    return completion.choices[0].message.content!
}