import db from '../services/database.js';

export const LoadTest = {
  find: (query) => db.collections.LoadTest.find(query),
  findOne: (query) => db.collections.LoadTest.findOne(query),
  create: (data) => db.collections.LoadTest.create(data),
  deleteMany: (query) => db.collections.LoadTest.deleteMany(query)
};
