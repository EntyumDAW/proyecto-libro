class LibrosCache {
    constructor() {
        this.cache = new Map();
        this.TTL = 24 * 60 * 60 * 1000; // 24 horas
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        // Verificar si expiró
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    set(key, data) {
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + this.TTL
        });
    }

    clear() {
        this.cache.clear();
    }
}

export const librosCache = new LibrosCache();