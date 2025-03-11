const initPage = () => {

    const PARTY_IDS = ['kd', 'kesk', 'kok', 'ps', 'rkp', 'sdp', 'vas', 'vihr']
    const PROFILE_IDS = [0, 1, 2, 3, 4, 5, 6, 9, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24]

    const partyIds = _.shuffle(PARTY_IDS)
    const profileIds = _.sampleSize(PROFILE_IDS, partyIds.length)
    const partyProfiles = partyIds.map((partyId, i) => ({
        partyId,
        profileId: profileIds[i]
    }))

    const partySelect = document.getElementsByClassName('partySelect')[0]

    for (const partyProfile of partyProfiles) {
        const element = document.createElement('div')
        element.classList.add('party')
        element.innerHTML = `
            <a href="/chat?partyId=${partyProfile.partyId}&profileId=${partyProfile.profileId}">
                <div class="img-container">
                    <img src="https://static.kannatan.fi/avatars-2025/${partyProfile.partyId}/${partyProfile.profileId}.png" class="party-character">
                    <img src="/images/${partyProfile.partyId}-logo.png" class="party-logo">
                </div>
            </a>
        `
        partySelect.appendChild(element)
    }
}

document.addEventListener('DOMContentLoaded', () => initPage())
