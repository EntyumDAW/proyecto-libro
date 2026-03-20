import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../utils/errorHandler.js';

describe('getErrorMessage()', () => {
    it('returns connection error when there is no response', () => {
        const err = new Error('Network Error');
        expect(getErrorMessage(err)).toBe('Connection error. Please check your internet connection.');
    });

    it('returns the server message when provided', () => {
        const err = { response: { status: 400, data: { error: 'User not found' } } };
        expect(getErrorMessage(err)).toBe('User not found');
    });

    it('returns 401 message when unauthorized', () => {
        const err = { response: { status: 401, data: {} } };
        expect(getErrorMessage(err)).toBe('You must be logged in to do this.');
    });

    it('returns 403 message when forbidden', () => {
        const err = { response: { status: 403, data: {} } };
        expect(getErrorMessage(err)).toBe('You do not have permission to perform this action.');
    });

    it('returns 404 message when not found', () => {
        const err = { response: { status: 404, data: {} } };
        expect(getErrorMessage(err)).toBe('The requested resource was not found.');
    });

    it('returns 500 message for server errors', () => {
        const err = { response: { status: 500, data: {} } };
        expect(getErrorMessage(err)).toBe('Server error. Please try again later.');
    });

    it('returns generic message for unknown status codes', () => {
        const err = { response: { status: 418, data: {} } };
        expect(getErrorMessage(err)).toBe('Unexpected error (418)');
    });
});
