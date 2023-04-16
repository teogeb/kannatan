import { handler } from './index.js'

const main = async () => {
    const response = await handler({
        requestContext: {
            http: {
                path: process.argv[2]
            }
        }
    }, undefined as any, undefined as any)
    const outputType = process.argv[3]
    const output = (outputType === 'html') ? response.body : JSON.stringify(response, undefined, 4)
    console.log(output)
}

main()