// @ts-nocheck
// Run the script from terminal with 'npm run generate'

import { storageContextFromDefaults, VectorStoreIndex } from 'llamaindex'
import { SimpleDirectoryReader } from '@llamaindex/readers/directory'
import readline from 'readline'
import fs from 'fs'
import path from 'path'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const getDocuments = async (documentPath) => {
    const documents = await new SimpleDirectoryReader().loadData({ directoryPath: documentPath })
    documents.forEach(doc => {
        doc.id_ = path.basename(doc.id_)
        doc.metadata.file_path = path.basename(doc.metadata.file_path)
    })
    return documents
}

const generateStore = async (documentPath, partyId) => {
    const persistDir = `store/${partyId}`

    if (fs.existsSync(persistDir)) {
        console.log(`'${persistDir}' already exists. Deleting it before generating new vector store...`)
        fs.rmSync(persistDir, { recursive: true, force: true })
    }

    console.log(`Generating vector store to '${persistDir}'...`)
    const documents = await getDocuments(path.resolve(documentPath))
    const storageContext = await storageContextFromDefaults({ persistDir })
    await VectorStoreIndex.fromDocuments(documents, { storageContext })
}

const getInput = async (query) => {
    return new Promise((resolve) => rl.question(query, resolve))
}

const start = async () => {
    try {
        const partyId = await getInput('\nEnter partyId (kd | kesk | kok | ps | rkp | sdp | vas | vihr):\n')
        const documentPath = await getInput('\nEnter path to the folder containing party documents:\n')
        rl.close()

        console.log()
        await generateStore(documentPath, partyId)
        console.log('Done')

    } catch (e) {
        console.error(e)
    }
}

start()
