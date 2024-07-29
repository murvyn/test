import helmet from 'helmet'
import compression from 'compression'
import { Application } from 'express'

export const prod = (app: Application) => {
    app.use(helmet())
    app.use(compression())
}