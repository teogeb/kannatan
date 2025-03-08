const BOT_TOKEN = '7665493266:AAHtP4Nkor9IqHP4y3FtKADPbzwAIIkLP3w'
const CHAT_ID = '-4671140742'

export const sendMessageToTelegramAdminGroup = async (text: string) => {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                chat_id: CHAT_ID
            })
        })
        const data = await response.json()
        console.log('Message sent:', data)
    } catch (error) {
        console.error('Error sending message:', error)
    }
}