import * as fs from 'fs';
import * as path from 'path';

// append log data to the daily log file or create a new file if it doesn't exist
export function logData(name: string, log: string) {
  const date = new Date();
  const logFileName = `../logs/${name}_${date.toISOString().slice(0, 10)}.txt`;
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

export function generateLogsReport(logsDirectory: string): string {
    const logsReport: string[] = [];
  
    // Read the directory contents
    const files = fs.readdirSync(logsDirectory);
  
    // Iterate through each file in the directory
    files.forEach((file) => {
      const filePath = path.join(logsDirectory, file);
  
      // Check if the file is a regular file
      if (fs.statSync(filePath).isFile()) {
        const logContent = fs.readFileSync(filePath, 'utf8');
        const logName = path.basename(file, path.extname(file));
  
        // Add the log name and content to the logs report
        logsReport.push(`Log Name: ${logName}`);
        logsReport.push('=============================================');
        logsReport.push(logContent);
        logsReport.push('=============================================');
      }
    });
  
    // Join the logs report array into a single string
    return logsReport.join('\n');
  }
