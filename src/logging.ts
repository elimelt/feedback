import * as fs from 'fs';
import * as path from 'path';
import { Log, LogEntry } from './types';


export const saveData = (prev: Log, entryData: any): Log => {
    const date = new Date();
    const datestring = date.toDateString() + " " + date.toTimeString()
    const newEntry: LogEntry = { timestamp: datestring, entry: entryData }
    
    let updatedLog = { ...prev }
    updatedLog.log = [...updatedLog.log, newEntry]

    return updatedLog    
}

export const generateLogReport = (log: Log): any => ( { name: log.name, content: log.log } )


export const generateLogsReport = (logs: Log[]): any => JSON.parse(JSON.stringify(logs))

// deprecated
/*export*/ function logData(name: string, log: string) {
  const date = new Date();
  const logFileName = `${name}_${date.toISOString().slice(0, 10)}.txt`;
  const logFilePath = path.join(__dirname, logFileName);

  if (fs.existsSync(logFilePath)) 
    fs.appendFile(logFilePath, log + '\n', (err) => 
      err && console.error('Error writing to log file:', err))
  else 
    fs.writeFile(logFilePath, log + '\n', (err) => 
      err && console.error('Error writing to log file:', err)
    )
}
