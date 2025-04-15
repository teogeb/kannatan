const initPage = () => {

    const PARTIES = [
        { id: 'kesk', name: 'Keskusta' },
        { id: 'kok', name: 'Kokoomus' },
        { id: 'kd', name: 'Kristillisdemokraatit' },
        { id: 'lib', name: 'Liberaalipuolue' },
        { id: 'nyt', name: 'Liike Nyt' },
        { id: 'ps', name: 'Perussuomalaiset' },
        { id: 'rkp', name: 'RKP' },
        { id: 'sdp', name: 'SDP' },
        { id: 'vas', name: 'Vasemmistoliitto' },
        { id: 'vihr', name: 'Vihreät'  }
    ]
    
    const MAX_PARTY_GENDER_AGE = 86400000
    let partyGenders = getLocalStorageJSON('partyGenders', MAX_PARTY_GENDER_AGE)
    if (partyGenders === undefined) {
        partyGenders = [..._.repeat('m', PARTIES.length / 2), ..._.repeat('f', PARTIES.length / 2)]
        setLocalStorageJSON('partyGenders', partyGenders)
    }

    const swiperWrapper = document.querySelector('.swiper-wrapper')
    PARTIES.forEach((party, i) => {
        const slide = document.createElement('div')
        slide.className = 'swiper-slide'
        slide.innerHTML = `
            <div class="party-item" data-party="${party.id}" class="no-select">
                <div class="avatar-and-logo">
                    <img class="avatar" src="/images/avatars/${party.id}-${partyGenders[i]}.png">
                    <img class="party-logo" src="/images/logos/${party.id}.png">
                </div>
                <div class="party-name">${party.name}</div>
            </div>
        `
        swiperWrapper.appendChild(slide)
    })

    const onPartySelected = (party) => {
        const gender = partyGenders[swiper.realIndex]
        window.location.href = `/chat?partyId=${party.id}&profileId=${gender}`
    }

    const initialSlide = _.random(0, PARTIES.length - 1, false)
    const swiper = new Swiper('.swiper', {
        loop: true,
        effect: 'slide',
        slidesPerView: 1,
        spaceBetween: 100,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        keyboard: {
            enabled: true
        },
        initialSlide,
        on: {
            init: function() {
                document.querySelector('.swiper-button-next')?.classList.add('no-select')
                document.querySelector('.swiper-button-prev')?.classList.add('no-select')
            },
            click: function() {
                const party = PARTIES[swiper.realIndex]
                onPartySelected(party)
            }
        }
    })
    document.getElementById('start-button').addEventListener('click', () => {
        const party = PARTIES[swiper.realIndex]
        onPartySelected(party)
    })
}

document.addEventListener('DOMContentLoaded', () => initPage())
