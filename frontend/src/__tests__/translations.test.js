import { describe, it, expect } from 'vitest';
import { traducir } from '../utils/translations.js';

describe('traducir()', () => {
    it('translates book condition values', () => {
        expect(traducir('nuevo')).toBe('New');
        expect(traducir('como_nuevo')).toBe('Like new');
        expect(traducir('buen_estado')).toBe('Good condition');
        expect(traducir('regular')).toBe('Fair');
    });

    it('translates listing type values', () => {
        expect(traducir('venta')).toBe('Sale');
        expect(traducir('intercambio')).toBe('Exchange');
    });

    it('translates listing status values', () => {
        expect(traducir('activo')).toBe('Active');
        expect(traducir('completado')).toBe('Completed');
        expect(traducir('cancelado')).toBe('Cancelled');
    });

    it('translates transaction status values', () => {
        expect(traducir('pendiente')).toBe('Pending');
        expect(traducir('aceptada')).toBe('Accepted');
        expect(traducir('rechazada')).toBe('Rejected');
        expect(traducir('completada')).toBe('Completed');
        expect(traducir('cancelada')).toBe('Cancelled');
    });

    it('translates copy status values', () => {
        expect(traducir('disponible')).toBe('Available');
        expect(traducir('reservado')).toBe('Reserved');
        expect(traducir('vendido')).toBe('Sold');
        expect(traducir('intercambiado')).toBe('Exchanged');
    });

    it('returns the original value when no translation exists', () => {
        expect(traducir('unknown_value')).toBe('unknown_value');
        expect(traducir('foobar')).toBe('foobar');
    });

    it('returns the original value for undefined input', () => {
        expect(traducir(undefined)).toBe(undefined);
        expect(traducir(null)).toBe(null);
    });
});
