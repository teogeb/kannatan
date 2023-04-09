import { handler } from './index.js'

const main = async () => {
    const response = await handler({
        requestContext: {
            http: {
                path: '/e/1/vihr'
            }
        }
    }, undefined as any, undefined as any)
    console.log(JSON.stringify(response, undefined, 4))
}

main()