export interface LogEntry {
    timestamp: string;
    entry: string;
}

export interface Log {
    name: string;
    log: LogEntry[];
}

export interface QueueItem {
    ip: string;
    timestamp: number;
}

