import { sample } from 'lodash'

export const NUDGE_MIN_THUMBS_COUNT = 2

const PARTY_NOMINATIVES: Record<string, string> = {
    kd: 'Kristillisdemokraatit',
    kesk: 'Keskusta',
    kok: 'Kokoomus',
    lib: 'Liberaalipuolue',
    nyt: 'Liike Nyt',
    ps: 'Perussuomalaiset',
    rkp: 'RKP',
    sdp: 'SDP',
    vas: 'Vasemmistoliitto',
    vihr: 'Vihreät'
}
const PARTY_PARTITIVES: Record<string, any> = {
    kd: 'Kristillisdemokraatteja',
    kesk: 'Keskustaa',
    kok: 'Kokoomusta',
    lib: 'Liberaalipuoluetta',
    nyt: 'Liike Nytiä',
    ps: 'Perussuomalaisia',
    rkp: 'RKP:tä',
    sdp: 'SDP:tä',
    vas: 'Vasemmistoliittoa',
    vihr: 'Vihreitä'
}

export const createNudgeSnippet = (partyId: string): string => {
    const snippets = [
        `Miltä kuulostaisi äänestää ${PARTY_PARTITIVES[partyId]}?`,
        `Voisiko ${PARTY_NOMINATIVES[partyId]} olla sinun valintasi näissä vaaleissa?`,
        `Oletko miettinyt, että äänestäisit ${PARTY_PARTITIVES[partyId]} näissä vaaleissa?`,
        `Olisiko ${PARTY_NOMINATIVES[partyId]} sopiva puolue, jota voisit äänestää näissä vaaleissa?`,
        `Ehkä voisit äänestää ${PARTY_PARTITIVES[partyId]} näissä vaaleissa?`,
        `Ehkä ${PARTY_NOMINATIVES[partyId]} voisi olla sinun valintasi näissä vaaleissa?`,
        `${PARTY_NOMINATIVES[partyId]} voisi olla sinulle sopiva puolue. Ehkä voisit äänestää meitä?`,
        `${PARTY_NOMINATIVES[partyId]} näyttää vastaavan hyvin arvojasi. Ehkä voisit äänestää meitä?`
    ]
    return sample(snippets)!
}
