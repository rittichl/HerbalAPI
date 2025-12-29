import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Extend Express Request interface to include transactionId
declare global {
    namespace Express {
        interface Request {
            transactionId?: string;
        }
    }
}

// Log levels
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

// Log interface
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    method: string;
    path: string;
    transactionId?: string;
    statusCode?: number;
    responseTime?: number;
    userId?: number;
    username?: string;
    ip?: string;
    userAgent?: string;
    error?: string;
}

class Logger {
    private static getLogDirectory(): string {
        return path.join(process.cwd(), 'logs');
    }

    private static ensureLogDirectory(): void {
        const logDir = this.getLogDirectory();
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    private static getLogFileName(level: LogLevel): string {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return `${level.toLowerCase()}-${dateStr}.log`;
    }

    private static getLogFilePath(level: LogLevel): string {
        return path.join(this.getLogDirectory(), this.getLogFileName(level));
    }

    private static writeToFile(level: LogLevel, formattedLog: string): void {
        try {
            this.ensureLogDirectory();
            const logFilePath = this.getLogFilePath(level);
            fs.appendFileSync(logFilePath, formattedLog + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    private static formatLog(entry: LogEntry): string {
        const { timestamp, level, message, method, path, transactionId, statusCode, responseTime, userId, username, ip, userAgent, error } = entry;

        let logMessage = `[${timestamp}] ${level}: ${message}`;
        logMessage += ` | Method: ${method} | Path: ${path}`;

        if (transactionId) logMessage += ` | TXID: ${transactionId}`;
        if (statusCode) logMessage += ` | Status: ${statusCode}`;
        if (responseTime) logMessage += ` | ResponseTime: ${responseTime}ms`;
        if (userId) logMessage += ` | UserId: ${userId}`;
        if (username) logMessage += ` | Username: ${username}`;
        if (ip) logMessage += ` | IP: ${ip}`;
        if (userAgent) logMessage += ` | UserAgent: ${userAgent}`;
        if (error) logMessage += ` | Error: ${error}`;

        return logMessage;
    }

    static info(message: string, req?: Request | null, res?: Response | null, additionalData?: any) {
        this.log('INFO', message, req || undefined, res || undefined, additionalData);
    }

    static warn(message: string, req?: Request | null, res?: Response | null, additionalData?: any) {
        this.log('WARN', message, req || undefined, res || undefined, additionalData);
    }

    static error(message: string, req?: Request | null, res?: Response | null, error?: any) {
        this.log('ERROR', message, req || undefined, res || undefined, { error: error?.message || String(error) });
    }

    static debug(message: string, req?: Request | null, res?: Response | null, additionalData?: any) {
        this.log('DEBUG', message, req || undefined, res || undefined, additionalData);
    }

    private static log(level: LogLevel, message: string, req?: Request | null, res?: Response | null, additionalData?: any) {
        const timestamp = new Date().toISOString();
        const entry: LogEntry = {
            timestamp,
            level,
            message,
            method: req?.method || 'N/A',
            path: req?.path || 'N/A',
            transactionId: req?.transactionId,
            statusCode: res?.statusCode,
            userId: req?.user?.id,
            username: req?.user?.username,
            ip: req?.ip || req?.socket.remoteAddress,
            userAgent: req?.get('User-Agent'),
            ...additionalData
        };

        const formattedLog = this.formatLog(entry);
        console.log(formattedLog);
        this.writeToFile(level, formattedLog);
    }
}

// Transaction ID middleware
export const transactionIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Generate unique transaction ID
    const transactionId = randomUUID();
    req.transactionId = transactionId;

    // Set transaction ID in response header
    res.setHeader('X-Transaction-Id', transactionId);

    // DEBUG: Verify middleware is being called
    console.log(`🎯 TRANSACTION MIDDLEWARE CALLED: ${transactionId} for ${req.method} ${req.path}`);

    next();
};

// Get current transaction ID
export const getTransactionId = (req: Request): string => {
    return req.transactionId || 'N/A';
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log request
    Logger.info('Request received', req);

    // Capture response finish
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        Logger.info('Response sent', req, res, { responseTime });
    });

    // Capture response errors
    res.on('close', () => {
        if (!res.writableEnded) {
            const responseTime = Date.now() - startTime;
            Logger.warn('Response closed prematurely', req, res, { responseTime });
        }
    });

    next();
};

// Error logging middleware
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction) => {
    Logger.error('Unhandled error occurred', req, res, error);
    next(error);
};

export default Logger;
