import { Handler } from 'aws-lambda'
import { omit } from 'lodash-es'
import { createApiResponse } from './api.js'
import { createResponse as createAboutPageResponse } from './pages/about.js'
import { createResponse as createAppPageResponse } from './pages/app.js'
import { createResponse as createFrontPageResponse } from './pages/front.js'
import { createResponse as createPartyPageResponse } from './pages/party.js'
import { createResponse as createBetaPageResponse } from './pages/beta.js'
import { HTTP_STATUS_NOT_FOUND, createHtmlResponse, createRobotsTxtResponse, createSiteMapResponse } from './utils.js'

interface HttpEvent {
    requestContext: {
        http: {
            method: string
            path: string
        }
    }
    body?: string
    queryStringParameters?: any
    headers?: Record<string, string> // TODO maybe the key is an array if there are multiple values?
}

interface HttpResponse {
    body: string,
    headers: Record<string, string>
    statusCode: number
}

const ROUTES: Record<string, (pathParams: Record<string, string>, sessionId: string | undefined, postData: any | undefined) => Promise<HttpResponse>> = {
    '/': createFrontPageResponse,
    '/app': createAppPageResponse,
    '/e/1/(?<partyId>[a-z]+)': createPartyPageResponse,
    '/about': createAboutPageResponse,
    '/api/(?<endpoint>.+)': createApiResponse,
    '/robots.txt': createRobotsTxtResponse,
    '/sitemap.xml': createSiteMapResponse,
    '/beta': createBetaPageResponse,
}

export const handler: Handler = async (event: HttpEvent) => {
    const path = event.requestContext.http.path
    let postData: any = undefined
    if (event.requestContext.http.method === 'POST') {
        postData = JSON.parse(event.body!)
    }
    const sessionId = event.queryStringParameters?.s ?? postData?.sessionId
    const requestContext = {
        sessionId,
        ...omit(event.queryStringParameters ?? {}, 's'),
        referer: event.headers?.referer,
        userAgent: event.headers?.['user-agent']
    }
    console.log(`Request: ${path} context=${JSON.stringify(requestContext)}` + ((postData !== undefined) ? ` postData=${JSON.stringify(omit(postData, 'sessionId'))}` : ''))
    for (const routePattern of Object.keys(ROUTES)) {
        const match = path.match(new RegExp(`^${routePattern}$`))
        if (match !== null) {
            const responseCreator = ROUTES[routePattern]
            return await responseCreator(match.groups ?? {}, sessionId, postData)
        }
    }
    return createHtmlResponse('', HTTP_STATUS_NOT_FOUND)
}