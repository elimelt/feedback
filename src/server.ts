import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import cron from 'node-cron';
import { ValidationError } from './errors';
import { validateEmail, validateSecret } from './validators';
import { LogManager } from './logManager';
import { EmailService } from './emailService';
import { Config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

class Server {
    private app: express.Application;
    private logManager: LogManager;
    private emailService: EmailService;
    private config: Config;

    constructor() {
        this.app = express();
        this.config = new Config();
        this.logManager = new LogManager();
        this.emailService = new EmailService(this.config);
        this.setupMiddleware();
        this.setupRoutes();
        this.setupCronJobs();
    }

    private setupMiddleware(): void {
        // middleware
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json({ limit: '10kb' }));
        
        // rate limiting - 100 requests per hour per IP
        const limiter = rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 100,
            message: 'Too many requests from this IP, please try again in an hour'
        });
        this.app.use(limiter);

        // request logging
        this.app.use(requestLogger);
    }

    private setupRoutes(): void {
        // feedback endpoint
        this.app.post('/feedback/send', async (req, res, next) => {
            try {
                const { name, email, feedback, secret } = req.body;

                if (!name || !email || !feedback) {
                    throw new ValidationError('Missing required fields');
                }

                validateEmail(email);
                validateSecret(secret, this.config.SECRET);

                const result = await this.emailService.forwardFeedback(name, email, feedback);
                res.json({ success: result });
            } catch (error) {
                next(error);
            }
        });

        // direct email endpoint
        this.app.post('/email', async (req, res, next) => {
            try {
                const { to, subject, content, secret } = req.body;

                if (!to || !subject || !content) {
                    throw new ValidationError('Missing required fields');
                }

                validateEmail(to);
                validateSecret(secret, this.config.SECRET);

                const result = await this.emailService.sendEmail(to, subject, content);
                res.json({ success: result });
            } catch (error) {
                next(error);
            }
        });

        // log writing endpoint
        this.app.post('/log/write', async (req, res, next) => {
            try {
                const { logName, content, secret } = req.body;

                if (!logName || !content) {
                    throw new ValidationError('Missing required fields');
                }

                validateSecret(secret, this.config.SECRET);

                await this.logManager.writeLog(logName, content);
                res.json({ success: true });
            } catch (error) {
                next(error);
            }
        });

        // log retrieval endpoint
        this.app.get('/log', async (req, res, next) => {
            try {
                const logs = await this.logManager.generateReport();
                res.json(logs);
            } catch (error) {
                next(error);
            }
        });

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });

        // error handler must be last
        this.app.use(errorHandler);
    }

    private setupCronJobs(): void {
        // daily log report at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                const report = await this.logManager.generateReport();
                await this.emailService.sendLogReport(report);
            } catch (error) {
                console.error('Failed to generate and send log report:', error);
            }
        });

        // hourly log cleanup
        cron.schedule('0 * * * *', async () => {
            try {
                await this.logManager.cleanup();
            } catch (error) {
                console.error('Failed to clean up logs:', error);
            }
        });
    }

    public start(port: number = 3001): void {
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}

const server = new Server();
server.start(Number(process.env.PORT) || 3001);

export default Server;
