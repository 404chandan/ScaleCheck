import { Analysis } from '../models/Analysis.js';
import { runRuleEngine } from '../services/analysis/ruleEngine.js';
import { generateSimulationData } from '../services/analysis/simulator.js';
import { getAIRecommendations } from '../services/ai/geminiService.js';

export async function createAnalysis(req, res) {
  try {
    const { name, backend, database, traffic, endpoints, infrastructure } = req.body;

    if (!name || !backend || !database || !traffic) {
      return res.status(400).json({ error: 'Missing required parameters name, backend, database, or traffic.' });
    }

    // 1. Run deterministic SRE rule engine
    const rulesResults = runRuleEngine({ name, backend, database, traffic, endpoints, infrastructure });

    // 2. Generate simulator data curves
    const simulation = generateSimulationData({ backend, database, traffic, endpoints, infrastructure });

    // 3. Assemble initial document
    const analysisPayload = {
      name,
      backend,
      database,
      traffic,
      endpoints: endpoints || [],
      infrastructure: infrastructure || { loadBalancer: false, cache: false, replicas: false, sharding: false, queue: false },
      results: rulesResults,
      aiRecommendation: null // To be populated
    };

    // 4. Fetch AI recommendations
    const aiResponse = await getAIRecommendations(analysisPayload);
    
    // Add simulation results to AI recommendations or save them together
    analysisPayload.aiRecommendation = {
      ...aiResponse,
      simulation // Bundle simulation data inside AI/results for client charts
    };

    // 5. Store in database (Mongoose or NeDB)
    const savedDoc = await Analysis.create(analysisPayload);

    res.status(201).json(savedDoc);
  } catch (error) {
    console.error('Error in createAnalysis:', error);
    res.status(500).json({ error: 'Failed to create analysis profile.', details: error.message });
  }
}

export async function getAnalyses(req, res) {
  try {
    const analyses = await Analysis.find({});
    res.json(analyses);
  } catch (error) {
    console.error('Error in getAnalyses:', error);
    res.status(500).json({ error: 'Failed to retrieve analyses.' });
  }
}

export async function getAnalysisById(req, res) {
  try {
    const { id } = req.params;
    const doc = await Analysis.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Analysis profile not found.' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Error in getAnalysisById:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis profile.' });
  }
}

export async function deleteAnalysis(req, res) {
  try {
    const { id } = req.params;
    const doc = await Analysis.delete(id);
    if (!doc) {
      return res.status(404).json({ error: 'Analysis profile not found.' });
    }
    res.json({ message: 'Analysis profile deleted successfully.', id });
  } catch (error) {
    console.error('Error in deleteAnalysis:', error);
    res.status(500).json({ error: 'Failed to delete analysis profile.' });
  }
}
