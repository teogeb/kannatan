import { Request } from 'express'
import { ContextChatEngine, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex'
import { without } from 'lodash'
import { Conversation, createConversation } from './createConversation'
import { generateSuggestions } from './generateSuggestions'
import { createUserHash, log, withoutLastParagraph } from './utils'
import { createNudgeSnippet, NUDGE_MIN_THUMBS_COUNT } from './nudge'

const CHAT_HISTORY_MESSAGE_COUNT = 20
const SUGGESTION_DUPLICATION_ANALYSIS_MESSAGE_COUNT = 10
const THUMBS_UP_SUGGESTION = 'Olen samaa mieltä'
const ELECTION_THEMES_SUGGESTION = 'Kerro kuntavaaliohjelmasta ja kerro aluevaaliohjelmasta.'
const VOTING_PRACTICALITIES_SUGGESTION = 'Äänestäminen'
const VOTING_PRACTICALITIES_ANSWER = 'Äänestäminen on helppoa!\n\nVoit äänestää sunnuntaina 13. huhtikuuta tai jo ennakkoon 2.–8. huhtikuuta. Tarvitset mukaasi vain voimassa olevan henkilöllisyystodistuksen.\n\nVoit tarkistaa oman äänestyspaikkasi aanestyspaikat.fi-sivulta.'

const getChatEngine = async (partyId: string): Promise<ContextChatEngine> => {
    const persistDir = `./store/${partyId}`
    const storageContext = await storageContextFromDefaults({ persistDir })
    const index = await VectorStoreIndex.init({ storageContext })
    const retriever = index.asRetriever()
    return new ContextChatEngine({ retriever })
}

const getUserMessageCount = (content: string, conversation: Conversation): number => {
    return conversation.messages.filter((m) => (m.role === 'user') && (m.content === content)).length
}

const generateAnswerAndSuggestions = async (question: string, partyId: string, conversation: Conversation): Promise<{ answer: string, suggestions: string[] }> => {
    if (question === VOTING_PRACTICALITIES_SUGGESTION) {
        return {
            answer: VOTING_PRACTICALITIES_ANSWER,
            suggestions: []
        }
    }
    const chatEngine = await getChatEngine(partyId)
    const chatHistory = [  // initial prompt and some recent messages (the AI hallucinates less when the conversation is reasonably short)
        conversation.messages[0],
        ...conversation.messages.slice(1).slice(-(CHAT_HISTORY_MESSAGE_COUNT - 1))]
    const chatResponse = await chatEngine.chat({ message: question, chatHistory })
    let answerAndSuggestions = chatResponse.message.content.toString()
    let answer = withoutLastParagraph(answerAndSuggestions)  // remove the last paragraph as it should only contain suggestions
    let suggestions = await generateSuggestions(answerAndSuggestions)
    const previousSuggestions = conversation.messages
        .slice(-SUGGESTION_DUPLICATION_ANALYSIS_MESSAGE_COUNT)
        .map((m) => m.suggestions ?? []).flat()
    const duplicateSuggestions = suggestions.filter((s) => previousSuggestions.includes(s))
    suggestions = without(suggestions, ...duplicateSuggestions)
    const lastMessageContent = conversation.messages.at(-1)?.content
    if ((lastMessageContent === THUMBS_UP_SUGGESTION) || (lastMessageContent === ELECTION_THEMES_SUGGESTION)) {
        suggestions.push(VOTING_PRACTICALITIES_SUGGESTION)
    }
    if (((lastMessageContent === THUMBS_UP_SUGGESTION)) && (getUserMessageCount(THUMBS_UP_SUGGESTION, conversation) >= NUDGE_MIN_THUMBS_COUNT)) {
        answer += `\n\n${createNudgeSnippet(partyId)}`
    }
    return {
        answer,
        suggestions
    }
}

const conversations: Map<string, Conversation> = new Map()

export const createChatResponse = async (req: Request): Promise<any> => {
    try {
        const startTime = Date.now()
        const existingConversation = (req.body.conversationId !== undefined) ? conversations.get(req.body.conversationId) : undefined
        const conversation = existingConversation ?? createConversation(req.body.partyId)
        if (existingConversation === undefined) {
            const userHash = createUserHash(req.ip, req.get('User-Agent'))
            const clientHints = {
                userAgent: req.headers['sec-ch-ua'],
                mobile: req.headers['sec-ch-ua-mobile'],
                platform: req.headers['sec-ch-ua-platform']
            }
            log('Start conversation', conversation.id, { partyId: req.body.partyId, profileId: req.body.profileId, userHash, clientHints })
            conversations.set(conversation.id, conversation)
        }
        conversation.messages.push({
            role: 'user',
            content: req.body.question
        })
        const { answer, suggestions } = await generateAnswerAndSuggestions(req.body.question, req.body.partyId, conversation)
        conversation.messages.push({
            role: 'assistant',
            content: answer,
            suggestions
        })
        log('Chat response', conversation.id, { question: req.body.question, answer, suggestions, elapsedTime: (Date.now() - startTime) })
        return { answer, conversationId: conversation.id, suggestions }
    } catch (error: any) {
        log(`Error: ${error.message}`, undefined, { error, requestBody: req.body })
        console.log(error)
        return { error: 'Error' }
    }
}

export const deleteConversation = (req: Request): void => {
    const success = conversations.delete(req.body.conversationId)
    if (success) {
        log(`Succesfully deleted conversation ${req.body.conversationId}`)
    } else {
        log(`Failed to delete conversation ${req.body.conversationId}`)
    }
}
