document.addEventListener('DOMContentLoaded', () => {

    const getStaticFilePath = (fileName) => {
        const prefix = (window.location.href.includes('localhost'))
            ? `/static/beta/`
            : 'https://static.kannatan.fi/beta/'
        return `${prefix}${fileName}`
    }

    document.getElementById('root').innerHTML = `
        <div class="profile">
            <div class="speech-bubble">
                <div class="statement"></div>
            </div>
            <div class="picture-container"></div>
        </div>
    `
    const persons = [{
        statement: 'Yksilönvapaus, yrittäjyys ja vähäinen valtion puuttuminen ovat tärkeitä.',
        image: 'lib-1715545416.png'
    }, {
        statement: 'Elämme ympäristön ehdoilla, jokainen teko luo kestävää tulevaisuutta.',
        image: 'virh-1715640851.png'
    }, {
        statement: 'Kielten tasa-arvo ja kulttuurien rikkaus ovat sydämeni asioita.',
        image: 'rkp-1715642415.png'
    }, {
        statement: 'Koulutuksen ja terveydenhuollon laatuun sijoittaminen on tärkeää.',
        image: 'kok-1715642909.png'
    }, {
        statement: 'Oikeudenmukaisuus ja tasa-arvo muodostavat yhteiskuntamme perustan.',
        image: 'sdp-1715643055.png'
    }, {
        statement: 'Yhteisön vahvuus ja perinteiden vaaliminen ovat sydämeni ytimessä.',
        image: 'ps-1715643253.png'
    }, {
        statement: 'Suojelen ympäristöä ja edistän yhteisöllisyyttä Suomen maaseudulla.',
        image: 'kesk-1715643393.png'
    }, {
        statement: 'Oikeudenmukaisuus ja tasavertaisuus ovat perusta paremmalle yhteiskunnalle.',
        image: 'vas-1715643587.png'
    }, {
        statement: 'Avoin hallinto ja kansalaisten osallistuminen ovat demokratian ydin.',
        image: 'nyt-1715643737.png'
    }]

    const profile = document.getElementsByClassName('profile')[0]
    const pictureContainer = document.getElementsByClassName('picture-container')[0]
    const speechBubble = document.getElementsByClassName('speech-bubble')[0]

    const createPictureElement = (person) => {
        const element = document.createElement('img')
        element.src = getStaticFilePath(person.image)
        return element
    }

    const setStatementText = (text) => {
        speechBubble.getElementsByClassName('statement')[0].textContent = text
    }

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    let index = -1;
    const setProfile = async (selected) => {
        index++
        const person = persons[index % persons.length]
        if (index > 0) {
            if (selected) {
                profile.classList.add('selected')
                const selectionAnimation = profile.animate([
                    { transform: 'translateX(0px) translateY(0px)' },
                    { transform: 'translateX(-2px) translateY(-2px)' },
                    { transform: 'translateX(2px) translateY(2px)' },
                    { transform: 'translateX(-2px) translateY(0px)' },
                    { transform: 'translateX(2px) translateY(2px)' },
                    { transform: 'translateX(0px) translateY(0px)' }
                ],{
                    duration: 400
                })
                await selectionAnimation.finished
                await wait(800)
                profile.classList.remove('selected')
            }
            setStatementText('')
            const newPicture = createPictureElement(person)
            pictureContainer.appendChild(newPicture)
            const changePictureAnimation = newPicture.animate([
                { opacity: 0 },
                { opacity: 1 }
            ],{
                duration: 400
            })
            await changePictureAnimation.finished
            pictureContainer.childNodes[0].remove()
            setStatementText(person.statement)
        } else {
            pictureContainer.appendChild(createPictureElement(person))
            setStatementText(person.statement)
        }
        const nextPerson = persons[(index + 1) % persons.length]
        new Image().src = getStaticFilePath(nextPerson.image)
    }

    setProfile()

    // Get a reference to the element you want to detect swipes on
    const swipeElement = document.getElementsByClassName('profile')[0]

    let startX, startY, endX, endY;

    // Function to handle the start of a touch
    function handleTouchStart(event) {
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    }

    // Function to handle the end of a touch
    function handleTouchMove(event) {
        // Prevent scrolling on touch
        event.preventDefault();
    }

    // Function to handle the end of a touch
    function handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        endX = touch.clientX;
        endY = touch.clientY;

        const diffX = endX - startX;
        const diffY = endY - startY;

        // Determine the swipe direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0) {
                console.log('Swiped right');
                setProfile(true)
            } else {
                console.log('Swiped left');
                setProfile()
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                console.log('Swiped down');
            } else {
                console.log('Swiped up');
            }
        }
    }

    // Attach the event listeners
    swipeElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    swipeElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    swipeElement.addEventListener('touchend', handleTouchEnd);
})
