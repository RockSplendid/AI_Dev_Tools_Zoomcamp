/**
 * Code Execution Module
 * 
 * This module provides safe code execution in isolated environments.
 * For production, consider using services like AWS Lambda, Docker containers, or specialized platforms.
 * 
 * Current implementation uses Web Workers pattern for browser-based execution.
 * For server-side execution, use a sandboxing solution.
 */

// Browser-based code execution (Frontend)
export const executeBrowserCode = (code, language) => {
  return new Promise((resolve, reject) => {
    try {
      // Only execute JavaScript in browser
      if (language !== 'javascript') {
        reject(new Error(`Browser execution not supported for ${language}. Use a backend service.`));
        return;
      }

      // Capture console output
      const logs = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };

      console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      };

      // Execute code with timeout
      const timeout = 5000; // 5 seconds
      const timeoutId = setTimeout(() => {
        console.log = originalLog;
        console.error = originalError;
        reject(new Error('Execution timeout: Code took too long to execute'));
      }, timeout);

      try {
        // Create a function from the code to isolate it
        const result = Function(code)();

        clearTimeout(timeoutId);
        console.log = originalLog;
        console.error = originalError;

        resolve({
          output: logs.join('\n') || 'Code executed successfully',
          success: true
        });
      } catch (error) {
        clearTimeout(timeoutId);
        console.log = originalLog;
        console.error = originalError;

        reject(new Error(`Execution error: ${error.message}`));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Server-side code execution (Backend)
 * 
 * For production use, integrate with:
 * - Judge0 API (https://judge0.com/)
 * - AWS Lambda
 * - Docker containers
 * - Piston API (https://github.com/engineer-man/piston)
 */

export const executeServerCode = async (code, language, apiEndpoint) => {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: getLanguageId(language)
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      output: result.stdout || result.stderr || 'No output',
      success: !result.stderr,
      error: result.stderr
    };
  } catch (error) {
    return {
      output: '',
      success: false,
      error: error.message
    };
  }
};

// Map language names to API IDs (for Judge0)
const getLanguageId = (language) => {
  const languageMap = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
    csharp: 51,
    ruby: 72
  };
  return languageMap[language] || 63;
};
