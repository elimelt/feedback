import sgMail from '@sendgrid/mail';
import { Config } from './config';
import { ValidationError } from './errors';
import { AccessReport, Log } from './types';

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
        const htmlReport = this.formatLogReportHtml(report);
        return this.sendMailWrapper({
            to: this.config.LOGGER_EMAIL,
            from: this.config.SENDER_EMAIL,
            subject: 'Daily Logs Report',
            text: JSON.stringify(report, null, 2),
            html: htmlReport
        });
    }

    public async sendAccessReport(report: AccessReport): Promise<boolean> {
        const htmlReport = this.formatAccessReportHtml(report);

        return this.sendMailWrapper({
            to: this.config.LOGGER_EMAIL,
            from: this.config.SENDER_EMAIL,
            subject: 'Daily Access Report',
            text: JSON.stringify(report, null, 2),
            html: htmlReport
        });
    }

    public formatAccessReportHtml(report: AccessReport): string {
        const tableRows = Object.entries(report.accessesByIP)
            .map(([ip, data]) => `
                <tr>
                    <td>${ip}</td>
                    <td>${data.lastAccess}</td>
                    <td>${data.totalAccesses}</td>
                    <td>${Object.entries(data.endpoints)
                        .map(([endpoint, count]) => `${endpoint}: ${count}`)
                        .join('<br>')}</td>
                </tr>
            `).join('');

        return `
            <h1>Access Report</h1>
            <p>Total Accesses: ${report.totalAccesses}</p>
            <p>Unique IPs: ${report.uniqueIPs}</p>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>IP Address</th>
                    <th>Last Access</th>
                    <th>Total Accesses</th>
                    <th>Endpoints (Count)</th>
                </tr>
                ${tableRows}
            </table>
        `;
    }

    public formatLogReportHtml(report: Log[]): string {
        const style = `
            <style>
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background-color: #f2f2f2;
                }
            </style>
        `;

        const tableRows = report.map(log => `
            <tr>
                <td>${log.name}</td>
                <td><pre>${JSON.stringify(log.log, null, 2)}</pre></td>
            </tr>
        `).join('');

        const rawReport = JSON.stringify(report, null, 2);

        const stats = `
            <h2>Stats</h2>
            <p>Total logs: ${report.length}</p>
        `;

        return `
            <html>
                <head>
                    ${style}
                </head>
                <body>
                    <h1>Log Report</h1>
                    ${stats}
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Log</th>
                        </tr>
                        ${tableRows}
                    </table>
                    <pre>${rawReport}</pre>
                </body>
            </html>
        `;

    }

}
