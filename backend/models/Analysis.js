import db from '../services/database.js';

export const Analysis = {
  find: (query) => db.collections.Analysis.find(query),
  findOne: (query) => db.collections.Analysis.findOne(query),
  findById: (id) => db.collections.Analysis.findById(id),
  create: (data) => db.collections.Analysis.create(data),
  update: (id, data) => db.collections.Analysis.update(id, data),
  delete: (id) => db.collections.Analysis.delete(id)
};
