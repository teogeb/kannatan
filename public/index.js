const getLocalStorageJSON = (key, maxAge) => {
    const value = localStorage.getItem(key)
    if (value !== null) {
        const parsed = JSON.parse(value)
        if (parsed.timestamp >= Date.now() - maxAge) {
            return parsed.data
        }
    }
    return undefined
}

const setLocalStorageJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify({ data: value, timestamp: Date.now() }))
}

const initPage = () => {

    const PARTY_IDS = ['kd', 'kesk', 'kok', 'ps', 'rkp', 'sdp', 'vas', 'vihr']
    const PROFILE_IDS = [..._.repeat('m', PARTY_IDS.length / 2), ..._.repeat('f', PARTY_IDS.length / 2)]
    const MAX_PARTY_PROFILE_AGE = 86400000

    let partyProfiles = getLocalStorageJSON('partyProfiles', MAX_PARTY_PROFILE_AGE)
    if (partyProfiles === undefined) {
        const partyIds = _.shuffle(PARTY_IDS)
        const profileIds = _.shuffle(PROFILE_IDS)
        partyProfiles = partyIds.map((partyId, i) => ({
            partyId,
            profileId: profileIds[i]
        }))
        setLocalStorageJSON('partyProfiles', partyProfiles)
    }

    const partySelect = document.getElementsByClassName('partySelect')[0]

    for (const partyProfile of partyProfiles) {
        const element = document.createElement('div')
        element.classList.add('party')
        element.innerHTML = `
            <a href="/chat?partyId=${partyProfile.partyId}&profileId=${partyProfile.profileId}">
                <div class="img-container">
                    <img src="https://static.kannatan.fi/avatars-2025/avatar-${partyProfile.profileId}-${partyProfile.partyId}.png" class="party-character">
                    <img src="/images/${partyProfile.partyId}-logo.png" class="party-logo">
                </div>
            </a>
        `
        partySelect.appendChild(element)
    }
}

document.addEventListener('DOMContentLoaded', () => initPage())
