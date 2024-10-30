import sgMail from '@sendgrid/mail';
import { Config } from './config';
import { ValidationError } from './errors';

export class EmailService {
    private config: Config;
    constructor(config: Config) {
        sgMail.setApiKey(config.SENDGRID_API_KEY);
        this.config = config;
    }

    private async sendMailWrapper(options: sgMail.MailDataRequired): Promise<boolean> {
        try {
            const [response] = await sgMail.send(options);
            return response.statusCode === 202;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send email');
        }
    }

    public async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
        return this.sendMailWrapper({
            to,
            from: this.config.SENDER_EMAIL,
            subject,
            text: content,
            html: content
        });
    }

    public async forwardFeedback(name: string, email: string, feedback: string): Promise<boolean> {
        const subject = `Feedback from ${name} (${email})`;
        return this.sendMailWrapper({
            to: this.config.FEEDBACK_EMAIL,
            from: this.config.SENDER_EMAIL,
            subject,
            text: feedback,
            html: `<p><strong>From:</strong> ${name} (${email})</p><p>${feedback}</p>`,
            replyTo: email
        });
    }

    public async sendLogReport(report: any): Promise<boolean> {
        return this.sendMailWrapper({
            to: this.config.LOGGER_EMAIL,
            from: this.config.SENDER_EMAIL,
            subject: 'Daily Logs Report',
            text: JSON.stringify(report, null, 2),
            html: `<pre>${JSON.stringify(report, null, 2)}</pre>`
        });
    }
}
