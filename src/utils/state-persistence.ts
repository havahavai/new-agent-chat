/**
 * Advanced State Persistence System
 * Handles all application state persistence with compression, encryption, and automatic cleanup
 */

export interface PersistenceConfig {
  key: string;
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
  version?: string; // For schema migrations
}

export interface PersistedState<T = any> {
  data: T;
  timestamp: number;
  version: string;
  checksum: string;
}

class StatePersistenceManager {
  private static instance: StatePersistenceManager;
  private encryptionKey: string | null = null;
  private compressionThreshold = 1024; // Compress data larger than 1KB

  private constructor() {
    this.initializeEncryption();
  }

  static getInstance(): StatePersistenceManager {
    if (!StatePersistenceManager.instance) {
      StatePersistenceManager.instance = new StatePersistenceManager();
    }
    return StatePersistenceManager.instance;
  }

  private initializeEncryption(): void {
    // Use a simple encryption key for demo purposes
    // In production, this should be properly managed
    this.encryptionKey =
      process.env.NEXT_PUBLIC_STATE_ENCRYPTION_KEY || "demo-key-123";
  }

  private generateChecksum(data: string): string {
    // Simple checksum for demo - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private compress(data: string): string {
    // Simple compression using LZ-string or similar
    // For demo purposes, we'll use a basic compression
    return btoa(encodeURIComponent(data));
  }

  private decompress(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data; // Return original if decompression fails
    }
  }

  private encrypt(data: string): string {
    if (!this.encryptionKey) return data;

    // Simple XOR encryption for demo purposes
    // In production, use proper encryption libraries
    let encrypted = "";
    for (let i = 0; i < data.length; i++) {
      const charCode =
        data.charCodeAt(i) ^
        this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  }

  private decrypt(data: string): string {
    if (!this.encryptionKey) return data;

    try {
      const encrypted = atob(data);
      let decrypted = "";
      for (let i = 0; i < encrypted.length; i++) {
        const charCode =
          encrypted.charCodeAt(i) ^
          this.encryptionKey!.charCodeAt(i % this.encryptionKey!.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch {
      return data; // Return original if decryption fails
    }
  }

  save<T>(config: PersistenceConfig, data: T): boolean {
    try {
      const state: PersistedState<T> = {
        data,
        timestamp: Date.now(),
        version: config.version || "1.0.0",
        checksum: "",
      };

      let serializedData = JSON.stringify(state);

      // Compress if enabled and data is large enough
      if (
        config.compress &&
        serializedData.length > this.compressionThreshold
      ) {
        serializedData = this.compress(serializedData);
      }

      // Encrypt if enabled
      if (config.encrypt) {
        serializedData = this.encrypt(serializedData);
      }

      // Generate checksum
      state.checksum = this.generateChecksum(serializedData);

      // Store with metadata
      const storageData = {
        data: serializedData,
        checksum: state.checksum,
        compressed:
          config.compress && serializedData.length > this.compressionThreshold,
        encrypted: config.encrypt,
        version: config.version || "1.0.0",
        timestamp: state.timestamp,
      };

      localStorage.setItem(config.key, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error("Failed to save state:", error);
      return false;
    }
  }

  load<T>(config: PersistenceConfig): T | null {
    try {
      const stored = localStorage.getItem(config.key);
      if (!stored) return null;

      const storageData = JSON.parse(stored);

      // Check TTL
      if (config.ttl && Date.now() - storageData.timestamp > config.ttl) {
        this.remove(config.key);
        return null;
      }

      // Verify checksum
      if (storageData.checksum !== this.generateChecksum(storageData.data)) {
        console.warn("Checksum mismatch, data may be corrupted");
        this.remove(config.key);
        return null;
      }

      let serializedData = storageData.data;

      // Decrypt if encrypted
      if (storageData.encrypted) {
        serializedData = this.decrypt(serializedData);
      }

      // Decompress if compressed
      if (storageData.compressed) {
        serializedData = this.decompress(serializedData);
      }

      const state: PersistedState<T> = JSON.parse(serializedData);

      // Version migration could be handled here
      if (config.version && state.version !== config.version) {
        console.warn("Version mismatch, consider migration");
      }

      return state.data;
    } catch (error) {
      console.error("Failed to load state:", error);
      this.remove(config.key);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove state:", error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear state:", error);
    }
  }

  cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      for (const key of keys) {
        if (
          key.startsWith("widget-state-") ||
          key.startsWith("layout-state-")
        ) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const storageData = JSON.parse(stored);
              // Remove data older than 30 days
              if (now - storageData.timestamp > 30 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup state:", error);
    }
  }

  getStats(): {
    totalKeys: number;
    totalSize: number;
    oldestTimestamp: number;
  } {
    try {
      const keys = Object.keys(localStorage);
      let totalSize = 0;
      let oldestTimestamp = Date.now();

      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
          try {
            const storageData = JSON.parse(item);
            if (
              storageData.timestamp &&
              storageData.timestamp < oldestTimestamp
            ) {
              oldestTimestamp = storageData.timestamp;
            }
          } catch {
            // Ignore non-JSON items
          }
        }
      }

      return {
        totalKeys: keys.length,
        totalSize,
        oldestTimestamp,
      };
    } catch (error) {
      console.error("Failed to get stats:", error);
      return { totalKeys: 0, totalSize: 0, oldestTimestamp: Date.now() };
    }
  }
}

// Export singleton instance
export const statePersistence = StatePersistenceManager.getInstance();

// Predefined configurations
export const PERSISTENCE_CONFIGS = {
  WIDGET_STATE: {
    key: "widget-state",
    compress: true,
    encrypt: false,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    version: "1.0.0",
  },
  LAYOUT_STATE: {
    key: "layout-state",
    compress: false,
    encrypt: false,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
    version: "1.0.0",
  },
  USER_PREFERENCES: {
    key: "user-preferences",
    compress: false,
    encrypt: true,
    ttl: 365 * 24 * 60 * 60 * 1000, // 1 year
    version: "1.0.0",
  },
  CHAT_HISTORY: {
    key: "chat-history",
    compress: true,
    encrypt: false,
    ttl: 90 * 24 * 60 * 60 * 1000, // 90 days
    version: "1.0.0",
  },
} as const;
