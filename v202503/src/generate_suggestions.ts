
import { OpenAI } from 'openai'
import { log } from '.'

const openai = new OpenAI()

export const generateSuggestions = async (answer: string) => {
    let suggestions = []

    const completion: OpenAI.ChatCompletion =  await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
        {role: 'user', content:`
            Poimi seuraavasta tekstistä enintään neljä olennaisinta ehdotusta, jotka liittyvät keskusteltavaan aiheeseen. Jos tekstissä ei ole selkeitä ehdotuksia, palauta tyhjä lista. Vastaa vain listana ilman selityksiä.
            Palauta vastaus täsmälleen seuraavassa muodossa: ["ehdotus1", "ehdotus2", "ehdotus3", "ehdotus4"].
            Ehdotuksia tulee olla maksimissaan neljä. Jokaisen ehdotuksen tulee olla vain maksimissaan kaksi sanaa. Jos olennaisia ehdotuksia on vähemmän kuin neljä, palauta vain ne.

            Tässä esimerkkejä teksteistä ja vastauksista:
                • Teksti:
                Kestävä talous on Vihreille tärkeä teema, jossa talouden tulee tukea ihmisten hyvinvointia ja sosiaalista oikeudenmukaisuutta. Tavoitteena on siirtyä kiertotalouteen, vähentää luonnonvarojen kulutusta ja edistää ekologisia investointeja. Vihreät haluavat myös tehdä verotuksesta reilumpaa ja torjua veronkiertoa. Miten tämä teema resonoi sinussa? Haluaisitko keskustella tarkemmin esimerkiksi kiertotaloudesta tai verouudistuksista?
                • Vastaus:
                ["Kiertotalous", "Verouudistukset"]

                • Teksti:
                Olet oikeassa! Varhaiskasvatus luo perustan arvoille, sosiaalisille taidoille ja oppimiselle. Se auttaa lapsia ymmärtämään yhteisön merkityksen ja vastuullisuuden. Haluaisitko keskustella lisää arvojen opettamisesta varhaiskasvatuksessa?
                • Vastaus:
                ["Haluan"]

                • Teksti:
                Vihreät haluavat palauttaa Suomen koulutuksen maailman parhaaksi. Tavoitteena on varmistaa laadukas varhaiskasvatus, perusopetus ja riittävä tuki koko koulutuspolun ajan. Koulutuksen rahoitus tulee nostaa muiden pohjoismaiden tasolle ja eriarvoistumista on ehkäistävä. Mitä mieltä olet koulutuksen rahoituksesta tai oppimiserojen kaventamisesta?
                • Vastaus:
                []

                • Teksti:
                Voimme keskustella monista aiheista, kuten ilmastonmuutoksesta, sosiaaliturvasta, koulutuksesta, tasa-arvosta tai kestävästä taloudesta. Mikä näistä kiinnostaa sinua eniten?
                • Vastaus:
                ["Ilmastonmuutos", "Sosiaaliturva", "Koulutus", "Tasa-arvo"]

                • Teksti:
                Vihreät edistävät tasa-arvoa ja yhdenvertaisuutta kaikilla elämänalueilla. Tavoitteena on purkaa eriarvoisuutta ja tukea erityisesti heikommassa asemassa olevia. Tasa-arvolain kokonaisuudistus ja palkkaohjelmat ovat keskeisiä toimenpiteitä. Mistä tarkemmin haluaisit keskustella tasa-arvon osalta? Voimme puhua esimerkiksi koulutuksesta, työelämästä tai sosiaalisista palveluista.
                • Vastaus:
                ["Koulutus", "Työelämä", "Sosiaaliset palvelut"]

            Luo vastaus seuraavalle tekstille:
            ${answer}`
        }],
    })

    try {
        suggestions = JSON.parse(completion.choices[0].message.content!)
    } catch (e: any) {
        console.error(`Could not parse text to list:\n${e.message}`)
    }

    log('--- suggestions: ' + suggestions)
    return suggestions
}