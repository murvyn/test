// import winston from 'winston'
import {createLogger, transports} from 'winston'
import {MongoDB} from 'winston-mongodb'
import 'dotenv/config'

const mongoDBUri = process.env.MONGODB_URI

if(!mongoDBUri) {
    throw new Error('MONGODB_URI environment variable is not set')
}

export const logger = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({filename: 'logger.log'}),
        new MongoDB({db: mongoDBUri, level: 'error', options: {useUnifiedTopology: true}})
    ],
    exceptionHandlers: [
        new transports.Console(),
        new transports.File({filename: 'exceptions.log'}),
    ],
    rejectionHandlers: [
        new transports.Console(),
        new transports.File({filename: 'exceptions.log'}),
    ]
})