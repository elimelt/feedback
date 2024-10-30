export interface LogEntry {
    timestamp: string;
    entry: string;
}

export interface Log {
    name: string;
    log: LogEntry[];
}

export interface AccessLog {
    ip: string;
    timestamp: string;
    endpoint: string;
    method: string;
    statusCode: number;
    userAgent?: string;
}

export interface AccessReport {
    totalAccesses: number;
    uniqueIPs: number;
    accessesByIP: {
        [ip: string]: {
            lastAccess: string;
            totalAccesses: number;
            endpoints: {
                [endpoint: string]: number;
            };
        };
    };
}