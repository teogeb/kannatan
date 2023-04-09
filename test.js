const { getPartyScores } = require('./utils')

const expect = (actual, expected) => {
    const e = JSON.stringify(expected, undefined, 4)
    const a = JSON.stringify(actual, undefined, 4)
    if (e !== a) {
        throw new Error(`Mismatch ${a} should be ${e}`)
    }
}

const scoreTest1 = async () => {
    const actual = getPartyScores(['kesk-0', 'kesk-2', 'kesk-4', 'kesk-6', 'kesk-8', 'kesk-10', 'kesk-12', 'kesk-14', 'kesk-16', 'kesk-18'])
    expect(actual, [{
        partyId: 'kesk',
        score: 2 + 1.9 + 1.8 + 1.7 + 1.6 + 1.5 + 1.4 + 1.3 + 1.2 + 1.1,
        minSelectionIndex: 0
    }])
}

const scoreTest2 = async () => {
    const actual = getPartyScores(['lib-0', 'kok-0', 'lib-1', 'kok-1', 'rkp-1', 'rkp-2', 'lib-2', 'nyt-3', 'rkp-3', 'vihr-3'])
    expect(actual, [{
        partyId: 'lib',
        score: 2 + 1.95 + 1.9,
        minSelectionIndex: 0
    }, {
        partyId: 'rkp',
        score: 1.95 + 1.9 + 1.85,
        minSelectionIndex: 4
    }, {
        partyId: 'kok',
        score: 2 + 1.95,
        minSelectionIndex: 1
    }, {
        partyId: 'nyt',
        score: 1.85,
        minSelectionIndex: 7
    },  {
        partyId: 'vihr',
        score: 1.85,
        minSelectionIndex: 9
    }])
}

const scoreTest3 = async () => {
    const actual = getPartyScores(['vas-6', 'sdp-6', 'sdp-8', 'sdp-4', 'sdp-10', 'vas-2', 'vas-4', 'vas-8', 'vas-10', 'sdp-2'])
    expect(actual, [{
        partyId: 'vas',
        score: 1.9 + 1.8 + 1.7 + 1.6 + 1.5,
        minSelectionIndex: 0
    }, {
        partyId: 'sdp',
        score: 1.9 + 1.8 + 1.7 + 1.6 + 1.5,
        minSelectionIndex: 1    
    }])
}

const main = async () => {
    const tests = [scoreTest1, scoreTest2, scoreTest3]
    for (const test of tests) {
        try {
            await test()
            console.error(`\u2713 ${test.name}: success`)
        } catch (e) {
            console.error(`\u2717 ${test.name}: ${e.message}`)
        }
    }
}

main()