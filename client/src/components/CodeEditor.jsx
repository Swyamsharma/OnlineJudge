import { useState } from 'react';
import Editor from '@monaco-editor/react';
import Loader from './Loader';

const defaultCode = {
    cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    javascript: `// Your code here
console.log('Hello, World!');`,
};

const languageMap = {
    cpp: 'cpp',
    javascript: 'javascript',
};

export default function CodeEditor({ onCodeRun, isRunning, onCodeSubmit, isSubmitting }) {
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(defaultCode.cpp);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(defaultCode[newLang] || '// Your code here');
    };
    
    const handleEditorChange = (value) => {
        setCode(value);
    };

    const handleRun = () => {
        onCodeRun({ language, code });
    };

    const handleSubmit = () => {
        onCodeSubmit({ language, code });
    };

    const anyActionInProgress = isRunning || isSubmitting;

    return (
        <div className="flex flex-col h-full bg-primary border border-border-color rounded-lg overflow-hidden">
            <div className="flex-none p-2 border-b border-border-color flex justify-between items-center">
                 <select 
                    value={language} 
                    onChange={handleLanguageChange} 
                    disabled={anyActionInProgress} 
                    className="p-1 border rounded text-sm bg-secondary text-text-primary border-border-color focus:ring-accent focus:border-accent disabled:opacity-50"
                 >
                    <option value="cpp">C++</option>
                    <option value="javascript">JavaScript</option>
                </select>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleRun} 
                        disabled={anyActionInProgress} 
                        className="px-4 py-1.5 text-sm font-semibold rounded-md bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50"
                    >
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={anyActionInProgress} 
                        className="px-4 py-1.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
            <div className="flex-grow relative min-h-0">
                <Editor
                    height="100%"
                    language={languageMap[language]}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    loading={<Loader />}
                    options={{
                        readOnly: anyActionInProgress,
                        padding: { top: 10 },
                        fontSize: 14,
                        lineNumbersMinChars: 3,
                        glyphMargin: false,
                        minimap: {
                            enabled: false,
                        },
                        contextmenu: false,
                        scrollbar: {
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                    }}
                />
            </div>
        </div>
    );
}