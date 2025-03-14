import crypto from 'crypto'
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

export const withoutLastParagraph = (text: string): string => {
    const linefeedPos = text.lastIndexOf('\n')
    if (linefeedPos !== -1) {
        return text.slice(0, linefeedPos).trim()
    } else {
        return text
    }
}

export const createUserHash = (ipAddress?: string, userAgent?: string) => {
    const hash = crypto.createHash('sha256')
    hash.update([ipAddress, userAgent, process.env.USER_HASH_SALT].join(''))
    return hash.digest('hex')
}
