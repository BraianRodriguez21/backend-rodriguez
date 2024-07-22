import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';
import { viewRouter } from './routes/viewRouter.js';
import productRouter from './routes/productRouter.js';
import authRouter from './routes/authRouter.js';
import { handlebarsConf } from './config/handlebarsConfig.js';
import { socketConf } from './config/socketConfig.js';
import { errorHandler } from './middleware/errorHandler.js';
import './config/passportConfig.js'; // Importa la configuración de Passport
import logger from './config/loggerConfig.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const httpServer = app.listen(config.port || 8080, () => logger.info(`Servidor en el puerto ${config.port || 8080}`));

handlebarsConf(app);
const io = socketConf(httpServer);

app.use((req, res, next) => {
    req.io = io;
    next();
});

mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => logger.info('Mongo connected'))
.catch(err => logger.error('Mongo connection error:', err));

app.use('/', viewRouter);
app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);


app.use(errorHandler);

app.get('/loggerTest', (req, res) => {
    logger.debug('Debug log');
    logger.http('HTTP log');
    logger.info('Info log');
    logger.warn('Warning log');
    logger.error('Error log');
    logger.fatal('Fatal log');
    res.send('Logs have been generated');
});

export { app };
