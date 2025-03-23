import { Document, Metadata, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex'
import { SimpleDirectoryReader } from '@llamaindex/readers/directory'
import readline from 'readline'
import fs from 'fs'
import path from 'path'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const getDocuments = async (documentPath: string): Promise<Document<Metadata>[]> => {
    const documents = await new SimpleDirectoryReader().loadData({ directoryPath: documentPath })
    documents.forEach(doc => {
        doc.id_ = path.basename(doc.id_)
        doc.metadata.file_path = path.basename(doc.metadata.file_path)
    })
    return documents
}

const generateStore = async (documentPath: string, partyId: string): Promise<void> => {
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

const getInput = async (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve))
}

const start = async () => {
    try {
        const [,, partyIdArg, documentPathArg] = process.argv
        if (partyIdArg && documentPathArg) {
            console.log(`Using provided arguments: partyId='${partyIdArg}', documentPath='${documentPathArg}'`)
            await generateStore(documentPathArg, partyIdArg)
        } else {
            const partyId = await getInput('\nEnter partyId (kd | kesk | kok | lib | nyt | ps | rkp | sdp | vas | vihr):\n')
            const documentPath = await getInput('\nEnter path to the folder containing party documents:\n')
            await generateStore(documentPath, partyId)
        }
        console.log('Done')
        process.exit(0)
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        rl.close()
    }
}

start()
