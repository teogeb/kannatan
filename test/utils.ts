export const expect = (actual: any, expected: any) => {
    const e = JSON.stringify(expected, undefined, 4)
    const a = JSON.stringify(actual, undefined, 4)
    if (e !== a) {
        throw new Error(`Mismatch ${a} should be ${e}`)
    }
}

export const runTests = async (tests: (() => Promise<void>)[]) => {
    for (const test of tests) {
        console.log()
        try {
            await test()
            console.error(`\u001b[32m\u2713\u001b[0m ${test.name}: success`)
        } catch (e: any) {
            console.error(`\u001b[31m\u2717\u001b[0m ${test.name}: ${e.message}`)
            process.exit(1)
        }
    }
}