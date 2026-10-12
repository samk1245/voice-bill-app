import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'db_fallback.json');

const readData = () => {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading fallback DB:', err);
    return { users: [], stores: [], products: [], orders: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing fallback DB:', err);
  }
};

// Simple query matcher helper
const matchesQuery = (item, query) => {
  if (!query) return true;
  for (const key in query) {
    if (query[key] && typeof query[key] === 'object' && !Array.isArray(query[key])) {
      // Handle operators like $or, $in, $ne if needed
      if ('$in' in query[key]) {
        if (!query[key].$in.includes(item[key])) return false;
      } else if ('$ne' in query[key]) {
        if (item[key] === query[key].$ne) return false;
      }
    } else {
      if (item[key] !== query[key]) return false;
    }
  }
  return true;
};

class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const db = readData();
    const list = db[this.collectionName] || [];
    return list.filter(item => matchesQuery(item, query));
  }

  async findOne(query = {}) {
    const db = readData();
    const list = db[this.collectionName] || [];
    const item = list.find(item => matchesQuery(item, query));
    return item || null;
  }

  async findById(id) {
    const db = readData();
    const list = db[this.collectionName] || [];
    const item = list.find(item => item._id === id);
    return item || null;
  }

  async create(data) {
    const db = readData();
    if (!db[this.collectionName]) db[this.collectionName] = [];
    
    let processedData = { ...data };
    if (this.collectionName === 'users' && processedData.password) {
      const salt = bcrypt.genSync ? bcrypt.genSaltSync(10) : 10;
      processedData.password = bcrypt.hashSync(processedData.password, salt);
    }

    // Create new record with random ID and timestamps
    const newRecord = {
      _id: `${this.collectionName.slice(0, 4)}_${Math.random().toString(36).substr(2, 9)}`,
      ...processedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db[this.collectionName].push(newRecord);
    writeData(db);
    return newRecord;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const db = readData();
    const list = db[this.collectionName] || [];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    const original = list[index];
    const updated = {
      ...original,
      ...update,
      updatedAt: new Date().toISOString()
    };

    db[this.collectionName][index] = updated;
    writeData(db);
    return updated;
  }

  async findOneAndUpdate(query, update, options = {}) {
    const db = readData();
    const list = db[this.collectionName] || [];
    const index = list.findIndex(item => matchesQuery(item, query));
    if (index === -1) return null;

    const original = list[index];
    const updated = {
      ...original,
      ...update,
      updatedAt: new Date().toISOString()
    };

    db[this.collectionName][index] = updated;
    writeData(db);
    return updated;
  }

  async findByIdAndDelete(id) {
    const db = readData();
    const list = db[this.collectionName] || [];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deleted = list.splice(index, 1)[0];
    writeData(db);
    return deleted;
  }

  async deleteOne(query) {
    const db = readData();
    const list = db[this.collectionName] || [];
    const index = list.findIndex(item => matchesQuery(item, query));
    if (index === -1) return { deletedCount: 0 };

    list.splice(index, 1);
    writeData(db);
    return { deletedCount: 1 };
  }

  async countDocuments(query = {}) {
    const db = readData();
    const list = db[this.collectionName] || [];
    return list.filter(item => matchesQuery(item, query)).length;
  }
}

export const MockUser = new MockModel('users');
export const MockStore = new MockModel('stores');
export const MockProduct = new MockModel('products');
export const MockOrder = new MockModel('orders');
export const MockCustomer = new MockModel('customers');
