import * as fs from 'fs';
import * as path from 'path';
import { Log } from './types';


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

export function saveData(prev: Log, log: string): Log {
    const date = new Date();
    
    let updatedLog = { ...prev }

    updatedLog.log = prev.log + date.toDateString() + " " + date.toTimeString() + " " + log + '\n';

    return updatedLog    
}

export function generateLogReport(log: Log): string {
    return log.name + '\n' +
        log.log
}

export function generateLogsReport(logs: Log[]): string {
    let result: string = "";

    logs.forEach(log => {
        result += '===========================================\n' 
        result += generateLogReport(log)
        result += '\n===========================================\n'
    })

    return result;
}
