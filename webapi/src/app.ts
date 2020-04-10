import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as mongoose from 'mongoose'
import { configure, getLogger } from 'log4js';
import * as Config from '../../config/config'
 
configure({
    appenders: { 
        cheese: { type: 'file', filename: 'cheese.log' },
        console: {type: 'console', level: 'debug'}
    },
    categories: {
        default:    { appenders: ['cheese', 'console'], level: 'info' },
        develop:    { appenders: ['console'], level: 'debug' },
        production: { appenders: ['cheese', 'console'], level: 'warn' },
    }
});
const logger = getLogger(Config.WEBAPI_LOGGER_LEVEL);


const DB_URL = Config.MONGODB_URL
mongoose.connect(DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, (err) => {
    if (err) logger.fatal(`Cannot connect to database: ${DB_URL}`)
    else logger.info(`Database is connected`)
})

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
    logger.info(req.method, req.url)
    next()
})

import { router as userRouter } from './controllers/user'
app.use('/user', userRouter)

import { router as deviceRouter } from './controllers/device'
app.use('/device', deviceRouter)

app.listen(Config.WEBAPI_PORT, () => { logger.info('Listening on :' + Config.WEBAPI_PORT)})