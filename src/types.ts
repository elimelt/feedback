export interface QueueItem {
    ip: string;
    timestamp: number;
  }
  
export interface LogEntry {
  timestamp: string
  entry: any
}

export interface Log {
  name: string
  log: LogEntry[]
}