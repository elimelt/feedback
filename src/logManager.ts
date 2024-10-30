import fs from 'fs/promises';
import path from 'path';
import { Log, LogEntry, AccessLog, AccessReport } from './types';

export class LogManager {
    private logs: Map<string, LogEntry[]>;
    private accessLogs: AccessLog[];
    private readonly logsDirectory: string;
    private readonly maxLogAge: number = 30 * 24 * 60 * 60 * 1000; // 30 days
    private readonly maxLogsPerType: number = 1000;

    constructor(logsDirectory: string = path.join(__dirname, 'logs')) {
        this.logs = new Map();
        this.accessLogs = [];
        this.logsDirectory = logsDirectory;
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await fs.mkdir(this.logsDirectory, { recursive: true });
            await this.loadLogs();
            await this.loadAccessLogs();
        } catch (error) {
            console.error('Failed to initialize logs:', error);
            throw new Error('Log initialization failed');
        }
    }

    private async loadAccessLogs(): Promise<void> {
        try {
            const filePath = path.join(this.logsDirectory, 'access_logs.json');
            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            if (exists) {
                const content = await fs.readFile(filePath, 'utf-8');
                this.accessLogs = JSON.parse(content);
            }
        } catch (error) {
            console.error('Failed to load access logs:', error);
            this.accessLogs = [];
        }
    }

    public async logAccess(log: AccessLog): Promise<void> {
        this.accessLogs.push(log);
        await this.saveAccessLogs();
    }

    private async saveAccessLogs(): Promise<void> {
        const filePath = path.join(this.logsDirectory, 'access_logs.json');
        await fs.writeFile(filePath, JSON.stringify(this.accessLogs, null, 2));
    }

    public async generateAccessReport(): Promise<AccessReport> {
        const report: AccessReport = {
            totalAccesses: this.accessLogs.length,
            uniqueIPs: new Set(this.accessLogs.map(log => log.ip)).size,
            accessesByIP: {}
        };

        this.accessLogs.forEach(log => {
            if (!report.accessesByIP[log.ip]) {
                report.accessesByIP[log.ip] = {
                    lastAccess: log.timestamp,
                    totalAccesses: 0,
                    endpoints: {}
                };
            }

            const ipReport = report.accessesByIP[log.ip];
            ipReport.totalAccesses++;
            ipReport.endpoints[log.endpoint] = (ipReport.endpoints[log.endpoint] || 0) + 1;

            if (new Date(log.timestamp) > new Date(ipReport.lastAccess)) {
                ipReport.lastAccess = log.timestamp;
            }
        });

        return report;
    }
    private async loadLogs(): Promise<void> {
        try {
            const files = await fs.readdir(this.logsDirectory);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(this.logsDirectory, file), 'utf-8');
                    const logName = file.replace('.json', '');
                    this.logs.set(logName, JSON.parse(content));
                }
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    }

    private async saveLogs(logName: string): Promise<void> {
        const logEntries = this.logs.get(logName);
        if (logEntries) {
            const filePath = path.join(this.logsDirectory, `${logName}.json`);
            await fs.writeFile(filePath, JSON.stringify(logEntries, null, 2));
        }
    }

    public async writeLog(logName: string, content: string): Promise<void> {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            entry: content
        };

        let logEntries = this.logs.get(logName) || [];
        logEntries = [entry, ...logEntries].slice(0, this.maxLogsPerType);
        this.logs.set(logName, logEntries);
        await this.saveLogs(logName);
    }

    public async generateReport(): Promise<Log[]> {
        const report: Log[] = [];
        for (const [name, entries] of this.logs.entries()) {
            report.push({ name, log: entries });
        }
        return report;
    }

    public async cleanup(): Promise<void> {
        const now = Date.now();
        for (const [logName, entries] of this.logs.entries()) {
            const filteredEntries = entries.filter(entry => {
                const entryDate = new Date(entry.timestamp).getTime();
                return now - entryDate < this.maxLogAge;
            });
            
            if (filteredEntries.length !== entries.length) {
                this.logs.set(logName, filteredEntries);
                await this.saveLogs(logName);
            }
        }
    }
}
