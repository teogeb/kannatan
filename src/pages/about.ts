import { createHeadTag, createHtmlResponse } from '../utils.js'

export const createResponse = async () => {
    const html = `
        <!DOCTYPE html>
        <html lang="fi">
        ${createHeadTag({
            pageTitle: 'Kannatan vaalikone: toiminta',
            additionalTags: [
                '<script src="https://static.kannatan.fi/lodash.min.js"></script>',
                '<script src="https://static.kannatan.fi/utils.js"></script>'
            ]
         })}
        <body>
            <div id="root">
                <img class="vote-box" src="https://static.kannatan.fi/vote-box.svg" alt="Äänestyslaatikko">
                <h1>Vaalikoneen toiminta</h1>
                <div class="sub-header">Vaalikoneessa on 10 puoluetta, ja jokaiselta puolueelta on valittavana 20 lausetta.</div>
                <div class="sub-header">Lauseet on poimittu vuoden 2023 vaaliohjelmista tai vastaavista puolueiden julkaisemista ohjelmista.</div>
                <div class="sub-header">Mukana ovat
                    <a href="/e/1/kesk">keskusta</a>,
                    <a href="/e/1/kd">kristillisdemokraatit</a>,
                    <a href="/e/1/kok">kokoomus</a>,
                    <a href="/e/1/lib">liberaalipuolue</a>,
                    <a href="/e/1/nyt">Liike Nyt</a>,
                    <a href="/e/1/ps">perussuomalaiset</a>,
                    <a href="/e/1/rkp">RKP</a>,
                    <a href="/e/1/sdp">SDP</a>,
                    <a href="/e/1/vas">vasemmistoliitto</a> ja 
                    <a href="/e/1/vihr">vihreät</a>.
                </div>
                <div class="sub-header">Kyseisille puolueille <a href="https://yle.fi/a/74-20020367">ennustetaan</a> merkittävää kannatusta kevään 2023 vaaleissa. Muihin vaaleihin osallistuviin puolueisiin voi tutusta esimerkiksi <a href="https://areena.yle.fi/1-64958651">YLEn pienipuoluetentissä</a>.</div>
                <div class="sub-header">Palaute: <a href="mailto:info@kannatan.fi">info@kannatan.fi</a></div>
                <a href="/"><div class="button">Etusivulle</div></a>
            </div>
        </body>
        </html>
    `
    return createHtmlResponse(html)
}
