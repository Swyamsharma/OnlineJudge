import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = 'llama3-70b-8192';
const EVALUATION_SERVICE_URL = 'http://evaluation-service:5001/run'; 

export const generateTestCases = async (req, res) => {
    const { problemStatement, constraints, referenceSolution, language, count } = req.body;

    if (!problemStatement || !constraints || !referenceSolution || !language || !count) {
        return res.status(400).json({ message: "Missing required data: statement, constraints, reference solution, language, and count are all required." });
    }

    const systemPrompt = "You are a specialized API that only returns valid, minified JSON. Do not include any text outside of the JSON structure. Adhere strictly to JSON syntax, ensuring no trailing commas.";

    const userPrompt = `
        Generate ${count} diverse and challenging test case inputs for the following competitive programming problem.
        The JSON object must have a single key "inputs" which is an array of strings. Each string is a single test case input.

        Problem Statement:
        """
        ${problemStatement}
        """

        Constraints:
        """
        ${constraints}
        """
    `;

    try {
        const completion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
        });

        const { inputs } = JSON.parse(completion.choices[0].message.content);

        if (!inputs || !Array.isArray(inputs)) {
            throw new Error("AI did not return a valid 'inputs' array.");
        }

        const verifiedTestcases = [];
        for (const input of inputs) {
            try {
                const response = await axios.post(EVALUATION_SERVICE_URL, {
                    language: language,
                    code: referenceSolution,
                    input: input,
                });
                
                const { verdict, output } = response.data;
                
                if (verdict === 'Success' || verdict === 'Accepted') {
                    verifiedTestcases.push({
                        input: input,
                        expectedOutput: output,
                    });
                } else {
                    console.warn(`[AI-Service] Skipping generated input because reference solution failed. Verdict: ${verdict}`);
                }
            } catch (evalError) {
                console.error(`[AI-Service] Error evaluating generated input: ${evalError.message}`);
            }
        }
        
        res.status(200).json(verifiedTestcases);

    } catch (error) {
        console.error("[AI-Service] Verified test case generation error:", error);
        if (error.code === 'json_validate_failed') {
            console.error("--- FAILED GENERATION PAYLOAD ---");
            console.error(error.failed_generation);
            console.error("---------------------------------");
        }
        res.status(500).json({ message: "Failed to generate and verify test cases." });
    }
};

export const debugWrongAnswer = async (req, res) => {
    const { code, language, failedTestCase, problemStatement } = req.body;

    if (!code || !language || !failedTestCase || !problemStatement) {
        return res.status(400).json({ message: "Missing required data for debugging." });
    }

    const prompt = `
        You are an expert AI programming tutor. A student's code has failed on a test case.
        Your task is to provide a concise, helpful hint without giving away the direct solution.
        Focus on the likely logical error based on the provided code and the discrepancy between the outputs.
        Do not write code. Explain the concept. Keep it to 2-3 sentences.

        Problem: """${problemStatement}"""
        Language: ${language}
        
        The code failed on this test case:
        Input:
        """
        ${failedTestCase.input}
        """

        Their code produced this output:
        """
        ${failedTestCase.actualOutput}
        """

        The correct output should have been:
        """
        ${failedTestCase.expectedOutput}
        """

        Here is their code:
        \`\`\`${language}
        ${code}
        \`\`\`

        Analyze the code and the test case, and provide a helpful hint.
    `;

    try {
        const completion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: prompt }],
        });

        const hint = completion.choices[0].message.content;
        res.status(200).json({ hint });
    } catch (error) {
        console.error("[AI-Service] Groq debugging hint error:", error);
        res.status(500).json({ message: "Failed to get debugging hint from AI service." });
    }
};