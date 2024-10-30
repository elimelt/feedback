import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('Error:', error);

    if (error instanceof ValidationError) {
        res.status(400).json({
            success: false,
            error: error.message
        });
        return;
    }

    if (error instanceof SyntaxError) {
        res.status(400).json({
            success: false,
            error: 'Invalid JSON'
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
}

