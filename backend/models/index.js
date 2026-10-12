import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import UserMongoose from './User.js';
import StoreMongoose from './Store.js';
import ProductMongoose from './Product.js';
import OrderMongoose from './Order.js';

import { MockUser, MockStore, MockProduct, MockOrder, MockCustomer } from '../config/db_fallback.js';

dotenv.config();

const useMongoose = !!process.env.MONGODB_URI;

let UserExport = MockUser;
let StoreExport = MockStore;
let ProductExport = MockProduct;
let OrderExport = MockOrder;
let CustomerExport = MockCustomer;
let fallback = true;

if (useMongoose) {
  UserExport = UserMongoose;
  StoreExport = StoreMongoose;
  ProductExport = ProductMongoose;
  OrderExport = OrderMongoose;
  // If using MongoDB, we would use a real mongoose Customer model, but since we are running in fallback local JSON sandbox, we maps to MockCustomer
  fallback = false;
}

export const User = UserExport;
export const Store = StoreExport;
export const Product = ProductExport;
export const Order = OrderExport;
export const Customer = CustomerExport;
export const isFallbackMode = fallback;

export const comparePasswords = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};
