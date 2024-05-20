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
          "statement": "Elän uskossa, perheessä, yhteisössä ja luontoa arvostaen.",
          "picture": "kd-1715904588-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Perhe, usko ja yhteisöllisyys ovat elämäni kulmakivet ja voima.",
          "picture": "kd-1715904630-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Rakkaus, usko ja yhteisöllisyys ovat elämäni kulmakivet ja ilo.",
          "picture": "kd-1715906335-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Usko, perhe ja yhteisö ovat elämäni kulmakivet ja voima.",
          "picture": "kd-1715906497-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Perhe, yhteisö ja usko ovat elämän perusta minulle.",
          "picture": "kd-1715906545-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Perhe, usko ja yhteisöllisyys ovat elämäni peruspilarit ja ilo.",
          "picture": "kd-1715939700-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Perhe, usko ja yhteisöllisyys ovat elämän perusta ja voima.",
          "picture": "kd-1715939730-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Perhe, yhteisö ja usko ovat elämäni peruspilarit ja voima.",
          "picture": "kd-1715939741-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Arvostan perhettä, yhteisöllisyyttä, suvaitsevaisuutta ja jokaisen auttamista arjessa.",
          "picture": "kd-1715939775-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Usko, perhe ja yhteisöllisyys ovat elämäni kulmakiviä Suomessa.",
          "picture": "kd-1715939795-greyscale.png",
          "party": "kd"
        },
        {
          "statement": "Rakastan luontoa, perinteitä ja yhdessäolon voimaa Suomen kesässä.",
          "picture": "kesk-1715904703-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Luonto, yhteisöllisyys ja kestävä elämäntapa ovat sydämeni arvot.",
          "picture": "kesk-1715904751-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Rakastan luontoa, yhteisöllisyyttä ja itsenäistä maalaiselämää syvästi sydämestäni.",
          "picture": "kesk-1715906671-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Rakkautta luontoon, perheeseen ja kestävään elämäntapaan maaseudulla.",
          "picture": "kesk-1715906711-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Vaalin luontoa, yhteisöä ja kestävää elämäntapaa maalaismaisemassa.",
          "picture": "kesk-1715906752-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Rakastan luontoa, maaseutua ja yhdessä tekemisen voimaa.",
          "picture": "kesk-1715939504-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Rakastan maaseutua, kestävyyttä, luonnonläheisyyttä ja yhteisön voimaa yhdessä.",
          "picture": "kesk-1715939549-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Luonto, yhteisö ja kestävä kehitys ovat minulle elämän ydin.",
          "picture": "kesk-1715939580-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Luonto, yhteisö ja kestävä kehitys ovat sydämeni arvot.",
          "picture": "kesk-1715939642-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Luonto, yhteisö ja kestävyys ovat elämäni peruspilarit ja iloni.",
          "picture": "kesk-1715939680-greyscale.png",
          "party": "kesk"
        },
        {
          "statement": "Uskomattoman talousoptimismin ja sosiaalisen vastuun puolesta työskentelen innolla.",
          "picture": "kok-1715904810-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Arvostan vapautta, vastuuta ja luonnon kauneutta elämässäni Suomessa.",
          "picture": "kok-1715904860-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Vapaus ja vastuu ohjaavat elämääni, rakastan kehittää yhteisöä.",
          "picture": "kok-1715906802-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Uskon vahvasti yrittäjyyteen, koulutukseen ja tulevaisuuden mahdollisuuksiin.",
          "picture": "kok-1715906932-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Vapaus, vastuu ja kestävä kehitys ohjaavat elämääni ja päätöksiäni.",
          "picture": "kok-1715906975-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Työ, koulutus ja yrittäjyys tuovat Suomeen vaurautta ja hyvinvointia.",
          "picture": "kok-1715907026-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Uskon yrittäjyyteen, koulutukseen ja jokaisen mahdollisuuksiin menestyä.",
          "picture": "kok-1715939368-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Arvostan yrittäjyyttä, koulutusta, ja kestävää kehitystä Suomessamme.",
          "picture": "kok-1715939438-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Tulevaisuus rakennetaan vapaudella, vastuulla ja innovaatioilla.",
          "picture": "kok-1715939447-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Arvostan kestävää kehitystä, yrittäjyyttä ja yhteisöllisyyttä Suomessa syvästi.",
          "picture": "kok-1715939503-greyscale.png",
          "party": "kok"
        },
        {
          "statement": "Uskon yksilön vapauteen, vastuuseen ja yrittäjyyteen koko sydämestäni.",
          "picture": "lib-1715904918-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Uskon vapauteen, yrittäjyyteen ja innovaatioihin – parempaa tulevaisuutta!",
          "picture": "lib-1715904963-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Uskon vapauteen, yrittäjyyteen ja yhteisön tukemiseen kaikessa toiminnassani.",
          "picture": "lib-1715905012-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Rakastan vapautta, itsenäisyyttä ja mahdollisuuksia yrittää vapaasti.",
          "picture": "lib-1715907085-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Kannatan vapautta, yrittäjyyttä ja vastuullista yhteiskuntaa täysillä sydämelläni.",
          "picture": "lib-1715907160-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Arvostan vapautta, vastuuta ja yritteliäisyyttä elämän kaikilla osa-alueilla.",
          "picture": "lib-1715907292-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Vapaus, yrittäjyys ja luovuus tekevät elämästäni merkityksellistä ja rikasta.",
          "picture": "lib-1715939199-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Yksilönvapaus ja yrittäjyys ovat minulle todella tärkeitä.",
          "picture": "lib-1715939288-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Kannatan henkilökohtaista vapautta ja yrittäjyyden tukemista Suomessa.",
          "picture": "lib-1715939311-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Rakastan vapautta, yrittäjyyttä ja yksilön oikeuksia – Liberaalipuolueen arvot.",
          "picture": "lib-1715939360-greyscale.png",
          "party": "lib"
        },
        {
          "statement": "Arvostan yhteisöllisyyttä, innovointia ja perinteiden kunnioittamista nykyajassa.",
          "picture": "nyt-1715905104-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Arvostan vastuullisuutta, yrittäjyyttä ja yhteisöllisyyttä elämässäni joka päivä.",
          "picture": "nyt-1715905160-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Vapaus, vastuu ja innovaatio ovat minulle elämän peruspilarit.",
          "picture": "nyt-1715905216-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Yhteisöllisyys, vastuullisuus ja vapaus ovat minulle tärkeitä arvoja.",
          "picture": "nyt-1715905265-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Haluan edistää yhteisöllisyyttä, innovaatioita ja kestävää kehitystä Suomessa.",
          "picture": "nyt-1715907341-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Arvostan yhteisöllisyyttä, yrittäjyyttä ja kestävää kehitystä kotiseudussa.",
          "picture": "nyt-1715907346-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Avoimuus, yhteisöllisyys ja modernisaatio ovat minulle tärkeitä arvoja.",
          "picture": "nyt-1715907391-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Uskon avoimuuteen, vastuullisuuteen ja innovaatioihin yhteisön hyväksi työskennellen.",
          "picture": "nyt-1715907450-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Vapaus ja kehitys ovat tärkeitä arvojani yhteiskunnassa.",
          "picture": "nyt-1715907491-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Uskon avoimuuteen, demokratiaan ja yksilönvapauteen suomalaisessa yhteisössä.",
          "picture": "nyt-1715939201-greyscale.png",
          "party": "nyt"
        },
        {
          "statement": "Rakastan Suomea, perinteitä ja luonnonrauhaa yli kaiken.",
          "picture": "ps-1715905356-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Suomalainen kulttuuri ja itsenäisyys ovat minulle todella tärkeitä.",
          "picture": "ps-1715905393-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan isänmaata, perinteitä ja yhdessäolon lämpöä suomalaisten kanssa.",
          "picture": "ps-1715905451-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan Suomea, perinteitä, perhettä ja kansallista yhteisöllisyyttä kaikille.",
          "picture": "ps-1715907527-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan Suomea, perinteitä ja yhteisöllisyyttä sydämeni pohjasta.",
          "picture": "ps-1715907565-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan isänmaata, perhettä ja perinteisen arjen yksinkertaisuutta.",
          "picture": "ps-1715907618-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Arvostan rehellisyyttä, perinteitä, yhteisöllisyyttä ja Suomen kaunista luontoa.",
          "picture": "ps-1715939052-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan Suomea, perinteitä ja itsenäisyyttä yli kaiken muun.",
          "picture": "ps-1715939055-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Arvostan yhteisöllisyyttä, perinteitä ja Suomen kaunista luontoa suuresti.",
          "picture": "ps-1715939134-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan suomalaista perinnettä, luontoa ja yhteisöllisyyttä kaikesta sydämestäni.",
          "picture": "ps-1715939139-greyscale.png",
          "party": "ps"
        },
        {
          "statement": "Rakastan monikulttuurisuutta, kieltä ja yhteisöllisyyttä elämässäni Suomessa.",
          "picture": "rkp-1715905530-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Arvostan monikulttuurisuutta, yhteisöllisyyttä ja kaksikielisyyttä sydämestäni.",
          "picture": "rkp-1715905566-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Arvostan kaksikielisyyttä, tasa-arvoa ja yhteisöllisyyttä Suomessa.",
          "picture": "rkp-1715905617-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Arvostan kaksikielisyyttä, kulttuuriperintöä ja yhteisöllisyyttä Suomessa sydämestäni.",
          "picture": "rkp-1715907546-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Kaksikielisyys ja monikulttuurisuus ovat sydämeni arvokkaita periaatteita.",
          "picture": "rkp-1715907594-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Arvostan monikulttuurisuutta, tasa-arvoa ja yhteisöllisyyttä Suomen sydämessä.",
          "picture": "rkp-1715907638-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Kielivähemmistöjen tukeminen ja kulttuurien moninaisuus ovat sydämeni asioita.",
          "picture": "rkp-1715938926-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Rakastan tasa-arvoa, monikielisyyttä ja yhteisöllisyyttä Suomessa.",
          "picture": "rkp-1715938933-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Arvostan kielten moninaisuutta, kulttuuria ja yhteisöllisyyttä Suomessa.",
          "picture": "rkp-1715938970-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Kulttuuriperinteet ja kaksikielisyys ovat sydämeni tärkeimmät arvot.",
          "picture": "rkp-1715938990-greyscale.png",
          "party": "rkp"
        },
        {
          "statement": "Arvostan tasa-arvoa, koulutusta ja kestävää kehitystä yhteisössäni.",
          "picture": "sdp-1715904428-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Yhdessä tasa-arvon puolesta, rakentaen kestävää ja oikeudenmukaista yhteisöä.",
          "picture": "sdp-1715904537-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Yhteisöllisyys ja tasa-arvo ovat sydämeni tärkeimmät arvot aina.",
          "picture": "sdp-1715905680-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Haluan tasa-arvoa, oikeudenmukaisuutta ja yhteisöllisyyttä kaikille suomalaisille.",
          "picture": "sdp-1715905734-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Yhdenvertaisuus, yhteisöllisyys ja oikeudenmukaisuus ovat minulle tärkeitä arvoja.",
          "picture": "sdp-1715905770-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Uskon tasa-arvoon, oikeudenmukaisuuteen ja yhteisöllisyyteen kaikille suomalaisille.",
          "picture": "sdp-1715907739-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Yhteisöllisyys, tasa-arvo ja ilo - elämän parhaat arvot minulle.",
          "picture": "sdp-1715907790-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Arvostan tasa-arvoa, yhteisöllisyyttä ja kestävää tulevaisuutta kaikille suomalaisille.",
          "picture": "sdp-1715907839-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Usko tasa-arvoon, yhteisöllisyyteen ja rehellisyyteen ohjaavat elämääni.",
          "picture": "sdp-1715907871-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Yhteisöllisyys ja tasa-arvo ovat sydämessäni aina etusijalla.",
          "picture": "sdp-1715907908-greyscale.png",
          "party": "sdp"
        },
        {
          "statement": "Välitän tasa-arvosta, kestävyydestä ja yhteisöllisyydestä jokapäiväisessä elämässäni.",
          "picture": "vas-1715905829-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Arvostan tasa-arvoa, ympäristöä, monikulttuurisuutta ja yhteisöllisyyttä elämässäni.",
          "picture": "vas-1715905887-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Yhteisöllisyys, tasa-arvo ja kestävyys ovat minulle sydämenasioita.",
          "picture": "vas-1715905958-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Välitän tasa-arvosta, yhteisöllisyydestä ja kestävästä kehityksestä sydämestäni.",
          "picture": "vas-1715906017-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Välitän tasa-arvosta, oikeudenmukaisuudesta ja kestävästä kehityksestä kaikille.",
          "picture": "vas-1715907687-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Rakastan tasa-arvoa, kestävyyttä ja yhteisöllisyyttä elämässäni ja työssäni.",
          "picture": "vas-1715907745-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Yhteisöllisyys, tasa-arvo ja kestävyys: elän näiden arvojen mukaisesti.",
          "picture": "vas-1715907789-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Yhteisöllisyys, solidaarisuus ja ympäristö ovat minulle sydämenasioita.",
          "picture": "vas-1715938651-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Yhteisöllisyys, tasa-arvo ja kestävä kehitys ovat sydämeni asioita.",
          "picture": "vas-1715938843-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Tasa-arvo, oikeudenmukaisuus ja yhteisöllisyys ovat minulle tärkeimpiä asioita.",
          "picture": "vas-1715938874-greyscale.png",
          "party": "vas"
        },
        {
          "statement": "Rakastan luontoa, kestävää elämäntapaa ja vihreitä arvoja sydämestäni.",
          "picture": "vihr-1715906079-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Rakastan luontoa, tasa-arvoa ja kestävää kehitystä kaikille ihmisille.",
          "picture": "vihr-1715906124-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Rakastan luontoa ja kestävää elämää yli kaiken, sydämestäni.",
          "picture": "vihr-1715906162-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Elämässäni arvostan kestävää kehitystä, yhteisöllisyyttä ja luonnon suojelua.",
          "picture": "vihr-1715906215-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Rakastan luontoa, kestävyys ja yhteisöllisyys ovat sydämessäni aina.",
          "picture": "vihr-1715906262-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Rakastan luontoa, yhteisöllisyyttä ja kestävää elämäntapaa suuresti.",
          "picture": "vihr-1715907911-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Välitän luonnosta, kestävyydestä ja tasa-arvosta yhteiskunnassamme.",
          "picture": "vihr-1715907956-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Arvostan luontoa, kestävyyttä ja yhteisöllisyyttä sydämestäni asti.",
          "picture": "vihr-1715907997-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Luonnon suojelu ja kestävä kehitys ovat sydäntäni lähellä.",
          "picture": "vihr-1715908053-greyscale.png",
          "party": "vihr"
        },
        {
          "statement": "Luonnonsuojelu ja kestävä elämä ovat minulle sydämenasioita.",
          "picture": "vihr-1715908086-greyscale.png",
          "party": "vihr"
        }
    ])

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
              console.log(increment + ' ' + new Date().toISOString() + ' ' + text.substring(0, len))
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
        if (profile.classList.contains('selected')) {
          return
        }
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
      const swipeElement = document.getElementsByClassName('profile')[0]
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
})
