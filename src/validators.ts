import { ValidationError } from './errors';

export function validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }
}

export function validateSecret(secret: string, expectedSecret: string): void {
    if (secret !== expectedSecret) {
        throw new ValidationError('Invalid secret');
    }
}
