const fs = require('fs')
const fsPromises = require('fs/promises')
const canvasGif = require('canvas-gif')
const { loadImage, registerFont } = require('canvas')

const PARTIES = {
    kd: { name: 'Kristillis&shy;demokraatit' },
    kesk: { name: 'Keskusta' },
    kok: { name: 'Kokoomus' },
    lib: { name: 'Liberaalipuolue' },
    nyt: { name: 'Liike Nyt' },
    ps: { name: 'Perus&shy;suomalaiset' },
    rkp: { name: 'RKP' },
    sdp: { name: 'SDP' },
    vas: { name: 'Vasemmisto&shy;liitto' },
    vihr: { name: 'Vihreät' }
}

const createHashtag = (partyId) => {
    return '#' + PARTIES[partyId].name.replace('&shy;', '').replace(' ', '').toLowerCase()
}

const getPhrases = async (partyId) => {
    const COMMENT_PREFIX = '#'
    const file = await fsPromises.readFile(`../../phrases/${partyId}.md`, 'utf-8')
    const lines = file.split('\n')
    return lines.filter((line) => !line.startsWith(COMMENT_PREFIX))
}

const getLines = (text, maxWidth, ctx) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]
    for (let i = 1; i < words.length; i++) {
        const appended = currentLine + ' ' + words[i]
        if (ctx.measureText(appended).width <= maxWidth) {
            currentLine = appended
        } else {
            lines.push(currentLine)
            currentLine = words[i]
        }
    }
    lines.push(currentLine)
    return lines
}

const main = async () => {

    registerFont('fonts/4iCs6KVjbNBYlgo6eA.ttf', { family: 'Ubuntu' })
    registerFont('fonts/KFOlCnqEu92Fr1MmYUtvAw.ttf', { family: 'Roboto' })

    const createGif = async (partyId) => {
        console.log(`Create: ${partyId}`)
        const phrases = await getPhrases(partyId)
        const images = [
            await loadImage(`avatars/${partyId}-1.svg`),
            await loadImage(`avatars/${partyId}-2.svg`),
            await loadImage(`avatars/${partyId}-3.svg`)
        ]
        const createFrame = (ctx, _width, _height, _totalFrames, currentFrame) => {
            const frameIndex = currentFrame - 1
            const rotation = ((frameIndex % 2) === 0) ? 0.04 : -0.01
            const drawSticker = (text, x, y, isRightAlign, backgroundColor) => {
                ctx.font = `40px "Roboto"`
                const height = 90
                const width = ctx.measureText(text).width
                if (isRightAlign) {
                    x = x - width
                }
                ctx.beginPath()
                ctx.fillStyle = backgroundColor
                ctx.ellipse(x, y + height / 2, height / 2, height / 2, 0, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.ellipse(x + width, y + height / 2, height / 2, height / 2, 0, 0, 2 * Math.PI)
                ctx.fill()
                ctx.fillRect(x, y, width, height)
                ctx.fillStyle = '#000000'
                ctx.fillText(text, x, y + height / 2 + 17)
            }
            const drawProgressBar = () => {
                for (let i = 0; i < phrases.length; i++) {
                    ctx.beginPath()
                    ctx.fillStyle = (i === frameIndex) ? '#aaaaaa' : '#444444'
                    ctx.ellipse(60 + i / phrases.length * 740, 1040, 8, 8, 0, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
            const drawStatement = () => {
                const phrase = phrases[frameIndex]
                const lines = getLines(phrase, 480, ctx)
                const fontSize = 45
                const lineHeight = fontSize * 1.3
                const boxHeight = (Math.max(lines.length, 4) + 2) * lineHeight
                ctx.save()
                ctx.translate(420, 580)
                ctx.rotate(rotation)
                ctx.fillStyle = '#9a00bd'
                ctx.fillRect(-360, -280, 860, boxHeight)
                ctx.lineWidth = 1
                ctx.strokeStyle = '#888888'
                ctx.strokeRect(-360, -280, 860, boxHeight)
                ctx.font = `${fontSize}px "Ubuntu"`
                ctx.fillStyle = '#ffffff'
                lines.forEach((text, i) => {
                    const width = ctx.measureText(text).width
                    const centerY = boxHeight / 2 - 230 - lines.length * lineHeight / 2
                    ctx.fillText(text, -width / 2 + 70, centerY + i * lineHeight)
                })
            }
            const drawAvatar = () => {
                ctx.restore()
                ctx.save()
                ctx.translate(800, 520)
                ctx.rotate(-rotation)
                ctx.drawImage(images[(frameIndex % 3)], -60 + (frameIndex % 2), -110 - (frameIndex % 2) * 5, 340, 340)
            }
            ctx.fillStyle = '#888800'
            drawSticker(createHashtag(partyId), 80, 40, false, '#eeeeee')
            drawSticker('#kannatan #vaalikone', 995, 890, true, '#eeeeee')
            drawProgressBar()
            drawStatement()
            drawAvatar()
            ctx.restore()
            ctx.fillStyle = '#9a00bd'
            ctx.font = `40px "Roboto"`
            ctx.fillText('kannatan.fi', 820, 1040)
            ctx.rotate(-90 * Math.PI / 180)
            ctx.fillStyle = '#888888'
            ctx.font = `20px "Ubuntu"`
            ctx.fillText('Kuva: CC Lisa Wischofsky', -270, 1040)
        }
        const output = await canvasGif('background.gif', createFrame, {
            fps: 0.3
        })
        fs.writeFileSync(`output/${partyId}.gif`, output)
    }

    for (const partyId of Object.keys(PARTIES)) {
        await createGif(partyId)
    }
}

main()
