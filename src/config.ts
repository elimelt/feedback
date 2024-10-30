import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export class Config {
    public readonly SECRET: string;
    public readonly SENDGRID_API_KEY: string;
    public readonly SENDER_EMAIL: string;
    public readonly FEEDBACK_EMAIL: string;
    public readonly LOGGER_EMAIL: string;

    constructor() {
        this.SECRET = process.env.SECRET || '';
        this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
        this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
        this.FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || '';
        this.LOGGER_EMAIL = process.env.LOGGER_EMAIL || '';

        this.validateConfig();
    }

    private validateConfig(): void {
        const requiredEnvVars = [
            'SECRET',
            'SENDGRID_API_KEY',
            'SENDER_EMAIL',
            'FEEDBACK_EMAIL',
            'LOGGER_EMAIL'
        ];

        const missingVars = requiredEnvVars.filter(
            varName => !process.env[varName]
        );

        if (missingVars.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missingVars.join(', ')}`
            );
        }
    }
}
