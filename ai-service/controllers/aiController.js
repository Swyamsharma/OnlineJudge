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
    const { problemStatement, constraints, referenceSolution, language, count, inputFormat, outputFormat, sampleTestcases } = req.body;

    const requiredFields = { problemStatement, constraints, referenceSolution, language, count, inputFormat, sampleTestcases };
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json({ message: `Missing required data: ${key} is required.` });
        }
    }

    const systemPrompt = "You are a specialized API that only returns valid, minified JSON. Do not include any text outside of the JSON structure. Adhere strictly to JSON syntax, ensuring no trailing commas.";

    const userPrompt = `
        You are an expert test case creator for competitive programming.
        Generate ${count} diverse and challenging test case inputs for the following problem.
        The JSON object you return must have a single key "inputs" which is an array of strings. Each string is a single test case input.

        ### Problem Statement
        """
        ${problemStatement}
        """

        ### Constraints
        """
        ${constraints}
        """

        ### Input/Output Format
        **You MUST strictly adhere to the following Input Format for every test case you generate.**

        **Input Format:**
        """
        ${inputFormat}
        """

        **Output Format:**
        """
        ${outputFormat || '(Not provided)'}
        """

        ### Sample Test Cases (Examples for you to follow)
        Pay close attention to the structure of these sample inputs (e.g., newlines, spaces, number of values per line). Your generated inputs MUST mimic this format.
        
        ${sampleTestcases.map((tc, i) => `
        --- Sample ${i + 1} ---
        Input:
        \`\`\`
        ${tc.input}
        \`\`\`
        Output:
        \`\`\`
        ${tc.expectedOutput}
        \`\`\`
        `).join('\n')}

        Now, generate the JSON object with ${count} new inputs.
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
                    console.warn(`[AI-Service] Skipping generated input because reference solution failed. Verdict: ${verdict}, Input: "${input.replace(/\n/g, '\\n')}"`);
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


const getHintPrompt = ({ verdict, code, language, problemStatement, failedTestCase }) => {
    let context = '';
    if (verdict === 'Wrong Answer') {
        context = `
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
        `;
    } else if (verdict === 'Time Limit Exceeded') {
        context = `The code received a "Time Limit Exceeded" verdict, meaning it was too slow. Analyze the code for potential performance bottlenecks like nested loops, inefficient algorithms, or slow I/O operations.`;
    } else if (verdict === 'Memory Limit Exceeded') {
        context = `The code received a "Memory Limit Exceeded" verdict. Analyze the code for high memory usage, such as large data structures or memory leaks.`;
    }

    return `
        You are an expert AI programming tutor. A student's code has failed.
        Your task is to provide a concise, helpful hint without giving away the direct solution.
        Focus on the likely logical or performance error.
        Do not write code. Explain the concept. Keep it to 2-4 sentences.

        Problem: """${problemStatement}"""
        Language: ${language}
        Verdict: ${verdict}
        
        ${context}

        Here is their code:
        \`\`\`${language}
        ${code}
        \`\`\`

        Analyze the code and provide a helpful hint.
    `;
};

export const getHint = async (req, res) => {
    const { verdict, code, language, problemStatement, failedTestCase } = req.body;

    if (!verdict || !code || !language || !problemStatement) {
        return res.status(400).json({ message: "Missing required data for getting a hint." });
    }
    if (verdict === 'Wrong Answer' && !failedTestCase) {
        return res.status(400).json({ message: "Wrong Answer hints require a failed test case." });
    }

    const prompt = getHintPrompt(req.body);

    try {
        const completion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: prompt }],
        });

        const hint = completion.choices[0].message.content;
        res.status(200).json({ hint });
    } catch (error) {
        console.error("[AI-Service] Groq hint error:", error);
        res.status(500).json({ message: "Failed to get hint from AI service." });
    }
};


export const analyzeCode = async (req, res) => {
    const { code, language, problemStatement } = req.body;

    if (!code || !language || !problemStatement) {
        return res.status(400).json({ message: "Missing required data for code analysis." });
    }

    const prompt = `
        You are an expert code reviewer specializing in competitive programming.
        Analyze the following correct solution to a problem.
        Your task is to:
        1. Determine the overall Time and Space Complexity (e.g., O(N log N), O(N)).
        2. Provide a brief, high-level explanation for your complexity analysis.
        3. Give one or two concise, actionable tips for potential optimization or alternative approaches. If the code is already optimal, state that.
        
        Format your response as a JSON object with two keys: "complexity" and "feedback".
        The "complexity" value should be a string (e.g., "Time: O(N), Space: O(1)").
        The "feedback" value should be a string containing your explanation and tips, using markdown for formatting (like lists).

        Problem: """${problemStatement}"""
        Language: ${language}

        Code:
        \`\`\`${language}
        ${code}
        \`\`\`
    `;

    try {
        const completion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const analysis = JSON.parse(completion.choices[0].message.content);
        res.status(200).json({ analysis });

    } catch (error) {
        console.error("[AI-Service] Groq analysis error:", error);
        if (error.code === 'json_validate_failed') {
            console.error("--- FAILED GENERATION PAYLOAD ---");
            console.error(error.failed_generation);
            console.error("---------------------------------");
        }
        res.status(500).json({ message: "Failed to get code analysis from AI service." });
    }
};