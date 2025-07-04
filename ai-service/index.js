import express from 'express';
import cors from 'cors';
import { generateTestCases, getHint, analyzeCode} from './controllers/aiController.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-testcases', generateTestCases);
app.post('/api/get-hint', getHint);
app.post('/api/analyze-code', analyzeCode);

const PORT = process.env.AI_PORT || 5002;
app.listen(PORT, () => console.log(`[AI-Service] Listening on port ${PORT}`));