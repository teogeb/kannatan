import { Request, Response } from 'express'
import { ContextChatEngine, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex'
import { without } from 'lodash'
import { Conversation, createConversation } from './createConversation'
import { generateSuggestions } from './generateSuggestions'
import { createUserHash, log, withoutLastParagraph } from './utils'

const CHAT_HISTORY_MESSAGE_COUNT = 20
const SUGGESTION_DUPLICATION_ANALYSIS_MESSAGE_COUNT = 5

const generateDatasource = async (partyId: string): Promise<VectorStoreIndex> => {
    const persistDir = `./store/${partyId}`
    const storageContext = await storageContextFromDefaults({ persistDir })
    const index = await VectorStoreIndex.init({ storageContext })
    return index
}

const conversations: Map<string, Conversation> = new Map()

export const createChatResponse = async (req: Request): Promise<any> => {
    try {
        const existingConversation = (req.body.conversationId !== undefined) ? conversations.get(req.body.conversationId) : undefined
        const conversation = existingConversation ?? createConversation(req.body.partyId)
        if (existingConversation === undefined) {
            const userHash = createUserHash(req.ip, req.get('User-Agent'))
            const clientHints = {
                userAgent: req.headers['sec-ch-ua'],
                mobile: req.headers['sec-ch-ua-mobile'],
                platform: req.headers['sec-ch-ua-platform']
            }
            log('Start conversation', conversation.id, { userHash, clientHints })
            conversations.set(conversation.id, conversation)
        }
        conversation.messages.push({
            role: 'user',
            content: req.body.question
        })

        const index = await generateDatasource(req.body.partyId)
        const retriever = index.asRetriever()
        const chatEngine = new ContextChatEngine({ retriever })
        const chatHistory = [  // initial prompt and some recent messages (the AI hallucinates less when the conversation is reasonably short)
            conversation.messages[0],
            ...conversation.messages.slice(1).slice(-(CHAT_HISTORY_MESSAGE_COUNT - 1))]
        const stream = await chatEngine.chat({ message: req.body.question, stream: true, chatHistory })
        
        log('Question', conversation.id, { question: req.body.question })
        const start = Date.now()
        let answerAndSuggestions = ''
        for await (const chunk of stream) {
            answerAndSuggestions += chunk.message.content.toString()
        }
        const end = Date.now()
        log('Answer', conversation.id, { answerAndSuggestions, elapsedTime: ((end - start) / 1000) })

        const answer = withoutLastParagraph(answerAndSuggestions)

        let suggestions = await generateSuggestions(answerAndSuggestions)
        const previousSuggestions = conversation.messages
            .filter((m) => m.role === 'assistant')
            .slice(-SUGGESTION_DUPLICATION_ANALYSIS_MESSAGE_COUNT)
            .map((m) => m.suggestions ?? []).flat()
        const duplicateSuggestions = suggestions.filter((s) => previousSuggestions.includes(s))
        suggestions = without(suggestions, ...duplicateSuggestions)
        log('Suggestions', conversation.id, { suggestions, duplicates: duplicateSuggestions } )

        conversation.messages.push({
            role: 'assistant',
            content: answer,
            suggestions
        })

        return { answer: answer, conversationId: conversation.id, suggestions: suggestions }
    } catch (error: any) {
        log(`Error: ${error.message}`, undefined, { error })
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
