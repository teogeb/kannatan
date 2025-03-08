import { without } from 'lodash'

export const log = (message: string, conversationId?: string, context?: any) => {
    let parts = without([
        new Date().toISOString(), 
        (conversationId !== undefined) ? conversationId.substring(0, 6) : undefined,
        message, 
        (context !== undefined) ? ` ${JSON.stringify(context)}` : undefined
    ], undefined)
    console.log(parts.join('   '))
}
