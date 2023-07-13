import * as fs from 'fs';
import * as path from 'path';
import { Log, LogEntry } from './types';


// append log data to the daily log file or create a new file if it doesn't exist
export function logData(name: string, log: string) {
  const date = new Date();
  const logFileName = `${name}_${date.toISOString().slice(0, 10)}.txt`;
  const logFilePath = path.join(__dirname, logFileName);

  // currently getting error rror creating log file: 
  // [Error: ENOENT: no such file or directory, open '/app/dist/logs/web_2023-07-12.txt']

  // if the log file already exists
  if (fs.existsSync(logFilePath)) {
    fs.appendFile(logFilePath, log + '\n', (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  } else { 
    // new log file and append the log data
    fs.writeFile(logFilePath, log + '\n', (err) => {
      if (err) {
        console.error('Error creating log file:', err);
      }
    });
  }
}

export function saveData(prev: Log, entryData: any): Log {
    const date = new Date();
    const datestring = date.toDateString() + " " + date.toTimeString()
    const newEntry: LogEntry = { timestamp: datestring, entry: entryData }
    
    let updatedLog = { ...prev }
    updatedLog.log = [...updatedLog.log, newEntry]

    return updatedLog    
}

export function generateLogReport(log: Log): any {
    return {name: log.name, content: log.log}
}

export function generateLogsReport(logs: Log[]): any {
    let result: any = JSON.parse(JSON.stringify(logs))

    return result;
}
