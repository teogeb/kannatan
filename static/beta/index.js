const showDialog = (header, text, buttonLabel, onSubmit) => {
  const element = document.getElementById('dialog')
  element.innerHTML = `
      <h1>${header}</h1>
      <p>${text}</p>
      <div class="button">${buttonLabel}</div>`
  element.classList.add('visible')
  element.getElementsByClassName('button')[0].addEventListener('click', () => {
      element.classList.remove('visible')
      element.innerHTML = ''
      onSubmit()
  })
}

const PARTIES = {
  kd: { nominative: 'Kristillisdemokraatit', partitive: 'Kristillisdemokraatteja' },
  kesk: { nominative: 'Keskusta', partitive: 'Keskustaa' },
  kok: { nominative: 'Kokoomus', partitive: 'Kokoomusta' },
  lib: { nominative: 'Liberaalipuolue', partitive: 'Liberaalipuoluetta' },
  nyt: { nominative: 'Liike Nyt', partitive: 'Liike Nyt -puoluetta' },
  ps: { nominative: 'Perussuomalaiset', partitive: 'Perussuomalaisia' },
  rkp: { nominative: 'RKP', partitive: 'RKP:tä' },
  sdp: { nominative: 'SDP', partitive: 'SDP:tä' },
  vas: { nominative: 'Vasemmistoliitto', partitive: 'Vasemmistoliittoa' },
  vihr: { nominative: 'Vihreät', partitive: 'Vihreitä' }
}

const createAdmirationPhrase = (partyId) => {
    const nominative = PARTIES[partyId].nominative
    const partitive = PARTIES[partyId].partitive
    const admirations = [
        `Kannatan ${partitive}.`,
        `Omaa arvomaailmaani edustaa parhaiten ${nominative}.`,
        `Harkitsen että äänestäisin ${partitive}.`,
        `${nominative} edistää minulle tärkeitä asioita.`
    ]
    const questions = [
        'Haluatko tietää miksi?',
        'Haluatko että kerron tarkemmin?',
        'Voin kertoa tarkemmin, jos haluat?',
        'Kiinnostaako perustelut?'
    ]
    return `${_.sample(admirations)} ${_.sample(questions)}`
}

document.addEventListener('DOMContentLoaded', () => {

    const getStaticFilePath = (fileName) => {
        const prefix = (window.location.href.includes('localhost'))
            ? `/tools/profile-generator/output/`
            : 'https://static.kannatan.fi/beta/profiles/'
        return `${prefix}${fileName}`
    }
  
    const persons = _.shuffle([
      {
        "statement": "Uskonto, perhe, yhteisöllisyys ja luonto – elämäni peruspilarit Suomessa.",
        "reason": "Äänestän Kristillisdemokraatteja, koska heidän arvonsa vastaavat omaa käsitystäni oikeudenmukaisuudesta ja perhekeskeisyydestä. Lisäksi arvostan heidän sitoutumistaan eettisiin periaatteisiin ja luonnon kunnioittamiseen.",
        "picture": "kd-1716250631-greyscale.png",
        "party": "kd"
      },
      {
        "statement": "Perhe, yhteisö ja kunnioitus ohjaavat elämääni ja päätöksiäni.",
        "reason": "Äänestän Kristillisdemokraatteja, koska heidän arvonsa perheestä ja yhteisöstä vastaavat omaa maailmankatsomustani. Heidän politiikkansa korostaa ihmisarvoa ja moraalia, jotka ovat minulle tärkeitä periaatteita.",
        "picture": "kd-1716250767-greyscale.png",
        "party": "kd"
      },
      {
        "statement": "Arvostan luontoa, yhteisöllisyyttä ja kestävää elämää maaseudulla.",
        "reason": "Äänestän Keskustaa koska he puolustavat maaseudun elinvoimaisuutta ja kestävää kehitystä. Keskusta arvostaa perinteitä ja yhteisöllisyyttä, jotka ovat minulle tärkeitä.",
        "picture": "kesk-1716250685-greyscale.png",
        "party": "kesk"
      },
      {
        "statement": "Yhteisöllisyys, perinteet ja luonto ovat elämäni peruspilarit Suomessa.",
        "reason": "Äänestän Keskustaa, koska arvostan maaseudun elinvoimaisuutta ja yhteisöllisyyttä. Keskustan arvot heijastavat omaa sitoutumistani luonnon suojeluun ja perinteiden vaalimiseen.",
        "picture": "kesk-1716250726-greyscale.png",
        "party": "kesk"
      },
      {
        "statement": "Arvostan kestävää kehitystä, yhteisöllisyyttä ja taloudellista vastuullisuutta.",
        "reason": "Äänestän Kokoomusta, koska puolue arvostaa taloudellista vastuullisuutta ja kestävää kehitystä, jotka ovat minulle tärkeitä arvoja. Lisäksi uskon, että Kokoomus edistää yrittäjyyttä ja yhteisön hyvinvointia, mikä tukee paikallista elinvoimaa.",
        "picture": "kok-1716250959-greyscale.png",
        "party": "kok"
      },
      {
        "statement": "Yritystoiminta, talousvastuu ja yhteisöllisyys ovat minulle tärkeitä arvoja.",
        "reason": "Äänestän Kokoomusta, koska uskon vahvaan talouspolitiikkaan ja yrittäjyyden tukemiseen. Puolue edustaa arvoja, jotka edistävät vastuullista taloudenpitoa ja yksilön vapautta kehittää liiketoimintaa.",
        "picture": "kok-1716250997-greyscale.png",
        "party": "kok"
      },
      {
        "statement": "Iloitsen vapaudesta, yrittäjyydestä ja jokaisen yhdenvertaisista mahdollisuuksista.",
        "reason": "Äänestän Liberaalipuoluetta, koska puolue tukee yksilönvapautta ja yrittäjyyttä, jotka ovat minulle tärkeitä arvoja. Lisäksi uskon, että Liberaalipuolue edistää tasa-arvoisia mahdollisuuksia kaikille kansalaisille.",
        "picture": "lib-1716250981-greyscale.png",
        "party": "lib"
      },
      {
        "statement": "Arvostan vapautta, avoimuutta ja mahdollisuuksien tasa-arvoa kaikille ihmisille.",
        "reason": "Äänestän Liberaalipuoluetta, koska puolue edistää henkilökohtaista vapautta ja yrittäjyyttä. Kannatan heidän tavoitettaan vähentää byrokratiaa ja lisätä yksilön vaikutusmahdollisuuksia yhteiskunnassa.",
        "picture": "lib-1716251059-greyscale.png",
        "party": "lib"
      },
      {
        "statement": "Uskon vapauteen, yhteisöllisyyteen, osallistumiseen ja nykyaikaisiin ratkaisuihin.",
        "reason": "Äänestän Liike Nytä, koska puolue arvostaa yksilön vapautta ja osallistumista päätöksentekoon. He tarjoavat nykyaikaisia ja innovatiivisia ratkaisuja, jotka vastaavat paremmin nyky-yhteiskunnan haasteisiin.",
        "picture": "nyt-1716251072-greyscale.png",
        "party": "nyt"
      },
      {
        "statement": "Arvostan yksilönvapautta, suoraa demokratiaa ja digitaalista innovointia.",
        "reason": "Äänestäisin Liike Nyt -puoluetta, koska arvostan heidän yksilönvapautta korostavaa politiikkaansa. Lisäksi uskon, että suora demokratia ja digitaalinen innovaatio ovat avainasemassa Suomen tulevaisuuden kehityksessä.",
        "picture": "nyt-1716251177-greyscale.png",
        "party": "nyt"
      },
      {
        "statement": "Rakastan Suomea ja haluan säilyttää kansalliset perinteemme.",
        "reason": "Äänestän Perussuomalaisia, koska he puolustavat suomalaista kulttuuria ja perinteitä, jotka ovat minulle tärkeitä. Lisäksi arvostan heidän maahanmuuttopolitiikkaansa, joka korostaa Suomen etua ja turvallisuutta.",
        "picture": "ps-1716251125-greyscale.png",
        "party": "ps"
      },
      {
        "statement": "Rakastan suomalaista luontoa, perinteitä ja yhteisöllisyyttä yli kaiken.",
        "reason": "Äänestän Perussuomalaisia, koska he puolustavat Suomen kulttuuriperintöä ja itsenäisyyttä. Minulle on tärkeää suojella kotimaisia arvoja ja paikallista elinkeinoa.",
        "picture": "ps-1716251177-greyscale.png",
        "party": "ps"
      },
      {
        "statement": "Rakastan tasa-arvoa, monikulttuurisuutta ja kestävää luonnon suojelua Suomessa.",
        "reason": "Äänestän RKP:tä, koska arvostan kaksikielisyyttä ja monikulttuurisuutta, joita puolue edistää. Lisäksi puolueen sitoutuminen kestävään kehitykseen ja ympäristönsuojeluun on minulle erittäin tärkeää.",
        "picture": "rkp-1716251224-greyscale.png",
        "party": "rkp"
      },
      {
        "statement": "Rakastan kulttuuria, suvaitsevaisuutta, yhteisöllisyyttä ja luonnon kauneutta Suomessa.",
        "reason": "Äänestän RKP:tä, koska puolue arvostaa suomenruotsalaista kulttuuriperintöä ja monikielisyyttä, jotka ovat minulle tärkeitä. Lisäksi puolueen arvoihin kuuluu suvaitsevaisuus ja luonnon kunnioitus, jotka vastaavat omaa maailmankuvaani.",
        "picture": "rkp-1716251281-greyscale.png",
        "party": "rkp"
      },
      {
        "statement": "Uskon tasa-arvoon, yhteisöllisyyteen ja kaikkien hyvinvointiin Suomessa.",
        "reason": "Äänestän SDP:tä, koska heidän arvonsa tasa-arvosta ja sosiaalisesta oikeudenmukaisuudesta vastaavat omiani. Heidän politiikkansa tarjoaa konkreettisia ratkaisuja hyvinvointivaltion kehittämiseksi ja kaikkien kansalaisten elinolojen parantamiseksi.",
        "picture": "sdp-1716251229-greyscale.png",
        "party": "sdp"
      },
      {
        "statement": "Yhdessä tasa-arvoa ja oikeudenmukaisuutta rakentamassa jokaiselle suomalaiselle.",
        "reason": "Äänestän SDP:tä, koska he puolustavat sosiaalista oikeudenmukaisuutta ja tasa-arvoa. Heidän arvonsa vastaavat henkilökohtaisia uskomuksiani yhteisön hyvinvoinnista ja kaikkien kansalaisten mahdollisuuksien tasaamisesta.",
        "picture": "sdp-1716251284-greyscale.png",
        "party": "sdp"
      },
      {
        "statement": "Välitän tasa-arvosta, ympäristöstä ja yhteisöllisyydestä kaikille meille.",
        "reason": "Äänestän Vasemmistoliittoa, koska kannatan tasa-arvoa ja sosiaalista oikeudenmukaisuutta. Lisäksi puolueen ympäristöystävälliset arvot ja kestävä kehitys ovat minulle tärkeitä.",
        "picture": "vas-1716251412-greyscale.png",
        "party": "vas"
      },
      {
        "statement": "Yhteisöllisyys, tasa-arvo ja ympäristönsuojelu ovat elämäni peruspilarit.",
        "reason": "Äänestän Vasemmistoliittoa, koska puolue tukee edistyksellistä sosiaalipolitiikkaa ja tasa-arvoa, jotka ovat minulle tärkeitä. Lisäksi arvostan heidän sitoutumistaan ympäristönsuojeluun ja kestävään kehitykseen.",
        "picture": "vas-1716252125-greyscale.png",
        "party": "vas"
      },
      {
        "statement": "Rakastan luontoa, oikeudenmukaisuutta ja eläinten suojelemista intohimoisesti.",
        "reason": "Äänestän Vihreitä, koska heidän arvonsa vastaavat omaa sitoutumistani ympäristönsuojeluun ja sosiaaliseen oikeudenmukaisuuteen. Puolue tukee kestävää kehitystä, joka on minulle sydämen asia.",
        "picture": "vihr-1716250583-greyscale.png",
        "party": "vihr"
      },
      {
        "statement": "Rakastan luontoa, kestävyyttä ja yhteisöllisyyttä arjessani.",
        "reason": "Äänestän Vihreitä, koska he ajavat ympäristönsuojelua ja kestävää kehitystä, jotka ovat minulle tärkeitä arvoja. Heidän politiikkansa tukee yhteisöllisyyttä ja hyvinvointia, joita haluan edistää omassa elämässäni.",
        "picture": "vihr-1716252407-greyscale.png",
        "party": "vihr"
      }
    ]
    )

    document.getElementById('root').innerHTML = `
      <div class="profile">
          <div class="speech-bubble">
              <div class="statement"></div>
          </div>
          <div class="picture-container">
              <div class="controls">
                  <div class="navigate-to-prev no-select">&#9001;</div>
                  <div class="select-profile no-select"></div>
                  <div class="navigate-to-next no-select">&#9002;</div>
              </div>
          </div>
      </div>
      <div id="dialog">
      </div>`

    const profile = document.getElementsByClassName('profile')[0]
    const pictureContainer = document.getElementsByClassName('picture-container')[0]
    const carouselControls = document.getElementsByClassName('picture-container')[0].getElementsByClassName('controls')[0]
    const speechBubble = document.getElementsByClassName('speech-bubble')[0]
    let index = 0
    let isProfileSelected = false

    const getPersonIndex = (increment) => {
        const result = index + increment
        if (result === -1) {
            return persons.length -1
        } else if (result === persons.length) {
            return 0
        } else {
            return result
        }
    }
 
    const createPictureElement = (person) => {
        const element = document.createElement('img')
        element.src = getStaticFilePath(person.picture)
        return element
    }

    let statementTextTimer = undefined
    const setStatementText = (text) => {
        if (statementTextTimer !== undefined) {
            clearInterval(statementTextTimer)
        }
        const target = speechBubble.getElementsByClassName('statement')[0]
        if (text !== '') {
          let len = 0
          statementTextTimer = setInterval(() => {
              const increment = (Math.random() < 0.5) ? 2 : 3
              len = Math.min(len + increment, text.length)
              target.textContent = text.substring(0, len)
              if (len === text.length) {
                  clearInterval(statementTextTimer)
              }
          }, 80)
        } else {
          target.textContent = ''
        }
    }

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const setProfile = async (indexIncrement) => {
        profile.classList.remove('selected')
        isProfileSelected = false
        index = getPersonIndex(indexIncrement)
        const person = persons[index]
        if (index > 0) {
            setStatementText('')
            const newPicture = createPictureElement(person)
            pictureContainer.insertBefore(newPicture, carouselControls);
            const changePictureAnimation = newPicture.animate([
                { opacity: 0 },
                { opacity: 1 }
            ],{
                duration: 400
            })
            await changePictureAnimation.finished
            pictureContainer.getElementsByTagName('img')[0].remove()
            setStatementText(person.statement)
        } else {
            pictureContainer.insertBefore(createPictureElement(person), carouselControls);
            setStatementText(person.statement)
        }
        const nextPerson = persons[getPersonIndex(1)]
        new Image().src = getStaticFilePath(nextPerson.picture)
    }

    setProfile(0)

    const selectProfile = async () => {
        if (isProfileSelected) {
          return
        }
        isProfileSelected = true
        setStatementText('')
        profile.classList.add('selected')
        const animation = profile.animate([
            { transform: 'translateX(0px) translateY(0px)' },
            { transform: 'translateX(-2px) translateY(-2px)' },
            { transform: 'translateX(2px) translateY(2px)' },
            { transform: 'translateX(-2px) translateY(0px)' },
            { transform: 'translateX(2px) translateY(2px)' },
            { transform: 'translateX(0px) translateY(0px)' }
        ],{
            duration: 400
        })
        await animation.finished
        setStatementText(createAdmirationPhrase(persons[index].party))
    }

    // https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-jascript
    if(window.matchMedia("(pointer: coarse)").matches) {
      // touchscreen
      const swipeElement = pictureContainer
      let startX, startY, endX, endY;
      function handleTouchStart(event) {
          const touch = event.touches[0];
          startX = touch.clientX;
          startY = touch.clientY;
      }
      function handleTouchMove(event) {
          // Prevent scrolling on touch
          event.preventDefault();
      }
      function handleTouchEnd(event) {
          const MIN_DIFF = 10
          const touch = event.changedTouches[0];
          endX = touch.clientX;
          endY = touch.clientY;
          const diffX = endX - startX;
          const diffY = endY - startY;
          if (Math.abs(diffX) < MIN_DIFF && Math.abs(diffY) < MIN_DIFF) {
              const x = event.changedTouches[0].clientX
              if (x <= (swipeElement.offsetWidth / 3)) {
                  setProfile(-1)
              } else if (x >= (swipeElement.offsetWidth * 2/3)) {
                  setProfile(1)
              } else {
                  selectProfile()
              }
              return
          }
          if (Math.abs(diffX) > Math.abs(diffY)) {
              // Horizontal swipe
              if (diffX > 0) {
                  console.log('Swiped right');
                  setProfile(-1)
              } else {
                  console.log('Swiped left');
                  setProfile(1)
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
      swipeElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      swipeElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      swipeElement.addEventListener('touchend', handleTouchEnd);
    } else {
      document.getElementsByClassName('navigate-to-prev')[0].addEventListener('click', (event) => {
        setProfile(-1)
        event.preventDefault()
      })
      document.getElementsByClassName('navigate-to-next')[0].addEventListener('click', (event) => {
        setProfile(1)
        event.preventDefault()
      })
      document.getElementsByClassName('select-profile')[0].addEventListener('click', (event) => {
        selectProfile()
        event.preventDefault()
      })
    }
    speechBubble.addEventListener('click', () => {
      if (isProfileSelected) {
        speechBubble.classList.add('hidden')
        pictureContainer.classList.add('hidden')
        const element = document.createElement('div')
        element.classList.add('conversation')
        element.innerHTML = `
            <img src="${getStaticFilePath(persons[index].picture)}"></img>
            <p>${persons[index].reason}</p>
            <div class="back-to-main no-select">&#9001;</div>
        `
        profile.appendChild(element)
        element.getElementsByClassName('back-to-main')[0].addEventListener('click', () => {
          speechBubble.classList.remove('hidden')
          pictureContainer.classList.remove('hidden')
          element.remove()
        })
      }
    })
})
