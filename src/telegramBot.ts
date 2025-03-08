import { log } from './utils'

export const sendMessageToTelegramAdminGroup = async (text: string) => {
    try {
        console.log(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`)
        console.log(process.env.TELEGRAM_CHAT_ID)
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                chat_id: process.env.TELEGRAM_CHAT_ID
            })
        })
        const data = await response.json()
        log('Feedback message sent to Telegram', undefined, data)
    } catch (error) {
        console.error('Error sending message:', error)
    }
}