import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'alerts.db');

// Initialize database
export function initDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
          return;
        }
        
        // Create tables
        db.serialize(() => {
          db.run(`
            CREATE TABLE IF NOT EXISTS alerts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              message TEXT NOT NULL,
              telegram_chat_id TEXT NOT NULL,
              alert_type TEXT NOT NULL,
              scheduled_time TEXT NOT NULL,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              sent INTEGER DEFAULT 0,
              cancelled INTEGER DEFAULT 0
            )
          `, (err) => {
            if (err) {
              console.error('Error creating alerts table:', err);
              reject(err);
              return;
            }
            
            // After first table is created, create second table
            db.run(`
              CREATE TABLE IF NOT EXISTS alert_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id INTEGER,
                offset_type TEXT NOT NULL,
                offset_value INTEGER NOT NULL,
                offset_unit TEXT NOT NULL,
                FOREIGN KEY (alert_id) REFERENCES alerts(id)
              )
            `, (err) => {
              if (err) {
                console.error('Error creating alert_configs table:', err);
                reject(err);
                return;
              }
              
              // Tables created successfully
              console.log('Database initialized successfully');
              resolve(db);
            });
          });
        });
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      reject(error);
    }
  });
}

export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err: Error | null) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}

export function promisifyDb(db: sqlite3.Database) {
  return {
    run: (sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes });
          }
        });
      });
    },
    get: (sql: string, params?: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err: Error | null, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    },
    all: (sql: string, params?: any[]): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
  };
}

