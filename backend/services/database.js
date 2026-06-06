import mongoose from 'mongoose';
import NeDB from 'nedb-promises';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

// Global DB Client Reference
class DatabaseService {
  constructor() {
    this.isMongo = false;
    this.collections = {
      Analysis: null,
      LoadTest: null
    };
  }

  async connect() {
    // Ensure local data directory exists for NeDB
    if (!fs.existsSync(config.dataDir)) {
      fs.mkdirSync(config.dataDir, { recursive: true });
    }

    try {
      console.log(`Connecting to MongoDB at: ${config.mongoUri.split('@')[1] || config.mongoUri}...`);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 3000 // Quick timeout to fallback fast
      });
      this.isMongo = true;
      console.log('Successfully connected to MongoDB. Using Mongoose models.');
      
      // Initialize Mongoose schemas and models
      this.initMongooseModels();
    } catch (error) {
      console.warn('MongoDB connection failed. Falling back to local NeDB files.');
      console.error(`Error details: ${error.message}`);
      this.isMongo = false;
      
      // Initialize NeDB files
      this.initNeDB();
    }
  }

  initMongooseModels() {
    // Schema definitions
    const analysisSchema = new mongoose.Schema({
      name: { type: String, required: true },
      backend: { type: String, required: true },
      database: { type: String, required: true },
      traffic: {
        users: { type: Number, required: true },
        rps: { type: Number, required: true },
        growth: { type: Number, default: 0 }
      },
      endpoints: [{
        method: { type: String, required: true },
        path: { type: String, required: true },
        readRatio: { type: Number, default: 50 },
        writeRatio: { type: Number, default: 50 },
        payloadSize: { type: Number, default: 10 }, // in KB
        dbOps: { type: Boolean, default: true }
      }],
      infrastructure: {
        loadBalancer: { type: Boolean, default: false },
        cache: { type: Boolean, default: false },
        replicas: { type: Boolean, default: false },
        sharding: { type: Boolean, default: false },
        queue: { type: Boolean, default: false }
      },
      results: {
        score: { type: Number, required: true },
        subscores: {
          scalability: { type: Number, required: true },
          reliability: { type: Number, required: true },
          availability: { type: Number, required: true }
        },
        bottlenecks: [{
          id: String,
          component: String,
          severity: String,
          title: String,
          description: String,
          mitigation: String
        }],
        recommendationText: String
      },
      aiRecommendation: mongoose.Schema.Types.Mixed,
      createdAt: { type: Date, default: Date.now }
    });

    const loadTestSchema = new mongoose.Schema({
      analysisId: { type: String, required: true },
      url: { type: String, required: true },
      duration: { type: Number, required: true },
      connections: { type: Number, required: true },
      results: {
        averageLatency: Number,
        p99Latency: Number,
        maxRps: Number,
        failureRate: Number,
        totalRequests: Number,
        throughput: Number
      },
      createdAt: { type: Date, default: Date.now }
    });

    // Mongoose Models
    const AnalysisModel = mongoose.model('Analysis', analysisSchema);
    const LoadTestModel = mongoose.model('LoadTest', loadTestSchema);

    // Dynamic standard wrappers
    this.collections.Analysis = {
      find: async (query = {}) => AnalysisModel.find(query).sort({ createdAt: -1 }),
      findOne: async (query) => AnalysisModel.findOne(query),
      findById: async (id) => AnalysisModel.findById(id),
      create: async (data) => AnalysisModel.create(data),
      update: async (id, data) => AnalysisModel.findByIdAndUpdate(id, data, { new: true }),
      delete: async (id) => AnalysisModel.findByIdAndDelete(id)
    };

    this.collections.LoadTest = {
      find: async (query = {}) => LoadTestModel.find(query).sort({ createdAt: -1 }),
      findOne: async (query) => LoadTestModel.findOne(query),
      create: async (data) => LoadTestModel.create(data),
      deleteMany: async (query) => LoadTestModel.deleteMany(query)
    };
  }

  initNeDB() {
    const analysisStore = NeDB.create({ filename: path.join(config.dataDir, 'analyses.db'), autoload: true });
    const loadTestStore = NeDB.create({ filename: path.join(config.dataDir, 'loadtests.db'), autoload: true });

    // Dynamic standard wrappers wrapping NeDB promises
    this.collections.Analysis = {
      find: async (query = {}) => {
        const docs = await analysisStore.find(query);
        return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      findOne: async (query) => analysisStore.findOne(query),
      findById: async (id) => analysisStore.findOne({ _id: id }),
      create: async (data) => {
        const docWithTime = { ...data, createdAt: new Date() };
        return analysisStore.insert(docWithTime);
      },
      update: async (id, data) => {
        await analysisStore.update({ _id: id }, { $set: data });
        return analysisStore.findOne({ _id: id });
      },
      delete: async (id) => {
        const doc = await analysisStore.findOne({ _id: id });
        await analysisStore.remove({ _id: id });
        return doc;
      }
    };

    this.collections.LoadTest = {
      find: async (query = {}) => {
        const docs = await loadTestStore.find(query);
        return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
      findOne: async (query) => loadTestStore.findOne(query),
      create: async (data) => {
        const docWithTime = { ...data, createdAt: new Date() };
        return loadTestStore.insert(docWithTime);
      },
      deleteMany: async (query) => loadTestStore.remove(query, { multi: true })
    };
  }
}

const db = new DatabaseService();
export default db;
