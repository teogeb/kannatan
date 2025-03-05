
import { OpenAI } from 'openai'
import { log } from '.'

const openai = new OpenAI()

export const generateSuggestions = async (answer: string): Promise<string[]> => {
    let suggestions = []

    const completion: OpenAI.ChatCompletion =  await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
        {
            role: 'system',
            content: `
            Tehtäväsi on analysoida annettu teksti ja poimia siitä olennaiset ehdotukset listamuotoon. Ehdotukset ovat yleensä keskustelun jatkamiseksi tarjottuja aiheita tai kysymyksiä, jotka käyttäjä voisi valita vastaukseksi. Ehdotukset ovat yleensä tekstin lopussa.
            Palauta vastaus täsmälleen seuraavassa muodossa: ["ehdotus1", "ehdotus2", "ehdotus3", "ehdotus4"].
            Ehdotuksia tulee olla maksimissaan neljä. Jokaisen ehdotuksen tulee olla vain maksimissaan kolme sanaa. Ehdotusten tulee olla kieliopillisesti perusmuodossa.
            Jos olennaisia ehdotuksia on vähemmän kuin neljä, palauta vain ne.
            Mikäli selkeitä ehdotuksia ei ole, vastaa sopivalla ehdotuksella, jolla keskustelua voi jatkaa. Ehdotusten tulee olla siinä järjestyksessä, missä niistä on mainittu tekstissä.

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

                • Teksti:
                Perussuomalaiset kannattavat tiukkaa maahanmuuttopolitiikkaa ja haluavat vähentää maahanmuuttoa EU- ja ETA-maiden ulkopuolelta. Puolueen mukaan nykyinen maahanmuuttopolitiikka on epäonnistunut, ja se aiheuttaa taloudellisia ja inhimillisiä kustannuksia. Haluamme myös tukea vapaaehtoista maastamuuttoa ja helpottaa suomalaisten paluumuuttoa. Voimme keskustella tarkemmin maahanmuuttopolitiikan yksityiskohdista tai vapaaehtoisen maastamuuton tukemisesta.
                • Vastaus:
                ["Maahanmuuttopolitiikan yksityiskohdat", "Vapaaehtoinen maastamuutto"]

                • Teksti:
                Perussuomalaiset kannattavat vapaaehtoista maastamuuttoa ja sen tukemista, erityisesti integroitumishaluttomien maahanmuuttajien osalta. Tavoitteena on helpottaa paluuta omille kansalaisille. Voimme keskustella tarkemmin Tanskan ja Ruotsin käytännöistä tai maahanmuuton vaikutuksista Suomeen.
                • Vastaus:
                ["Maahanmuuttopolitiikan yksityiskohdat", "Vapaaehtoinen maastamuutto"]

                • Teksti:
                Vapaaehtoista maastamuuttoa, erityisesti integroitumishaluttomien maahanmuuttajien osalta, on tärkeää. Haluaisitko kuulla tarkemmin yksityiskohdista?
                • Vastaus:
                ["Haluan"]

                • Teksti:
                Perussuomalaiset vaativat maahanmuuton laadun ja määrän tehokasta hallintaa. Puolueen mukaan työperäistä maahanmuuttoa tulisi rajoittaa EU:n ulkopuolelta, ellei kyse ole koulutetuista henkilöistä. Kiinnostaako sinua tietää tarkemmin puolueen ehdotuksista tai sanktioista ulkomaalaisrikkomuksista?
                • Vastaus:
                ["Puolueen ehdotukset", "Sanktiot"]

                • Teksti:
                Perussuomalaisten näkemyksen mukaan maahanmuuttopolitiikkaa tulee tiukentaa. Puolue korostaa, että integraatio-ongelmat ovat olleet jatkuvia, ja maahanmuuton negatiivisia vaikutuksia on vähennettävä lainsäädännöllä. Haluatko tietää lisää puolueen ehdotuksista maahanmuuton tiukentamiseksi tai vapaaehtoisen maastamuuton tukemisesta?
                • Vastaus:
                ["Maahanmuuton tiukentaminen", "Maastamuutto"]

                • Teksti:
                Kolmas sektori tarjoaa mahdollisuuksia vertaistuelle ja yhteisöllisyydelle, mutta sen roolia on tarkasteltava kriittisesti. Tavoitteena on tarjota sellaista, mitä julkinen tai yksityinen sektori ei voi. Voitko kertoa tarkemmin, mitä haluaisit tietää kolmannesta sektorista? Voimme keskustella sen merkityksestä, haasteista tai Perussuomalaisten näkemyksistä asiassa.
                • Vastaus:
                ["Merkitykset", "Haasteet", "Perussuomalaisten näkemykset"]

                • Teksti:
                Perussuomalaisten mukaan maahanmuutto on aiheuttanut merkittäviä taloudellisia ja sosiaalisia haasteita. Maahanmuuttajat ovat yliedustettuina tulonsiirroissa, ja heidän sosiaalitukiriippuvuutensa on kasvanut. Puolueen ohjelmassa todetaan, että "maahanmuuttajat eivät ole suomalaisia eläkkeiden rahoittajia tai työvoimapulan paikkaajia". Voimme tarkastella tarkemmin maahanmuuton vaikutuksia julkiseen talouteen tai keskustella siitä, miten puolue ehdottaa maahanmuuton laadun parantamista.
                • Vastaus:
                ["Julkinen talous", "Laadun parantaminen"]

                • Teksti:
                "Perussuomalaisten näkemyksen mukaan ikääntyviä työntekijöitä tulee arvostaa ja heidän työllisyyttään parantaa. Puolue korostaa, että ikääntyvät työntekijät ovat arvokasta työvoimaa, ja heidän osaamistaan tulisi hyödyntää. Työllisyyden parantamiseksi on tärkeää tarjota lisäkoulutusta ja muuttaa asenteita työpaikoilla. Voimme keskustella tarkemmin ikääntyvien työntekijöiden koulutuksesta tai työmarkkinoiden haasteista heidän osaltaan."
                • Vastaus:
                ["Ikääntyvien työntekijöiden koulutus", "Työmarkkinoiden haasteet"]`
        }, {
            role: 'user',
            content: answer
        }],
    })

    try {
        suggestions = JSON.parse(completion.choices[0].message.content!)
    } catch (e: any) {
        console.error(`Could not parse text to list:\n${e.message}`)
    }

    return suggestions
}