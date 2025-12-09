/**
 * WASM-based code execution utilities
 * Executes code safely in the browser using WebAssembly
 */

let pyodide = null;
let pyodideLoaded = false;
let pyodideLoading = false;

/**
 * Initialize Pyodide for Python WASM execution
 */
export async function initializePyodide() {
  if (pyodideLoaded) return { success: true };
  if (pyodideLoading) {
    // Wait for ongoing load
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (pyodideLoaded) {
          clearInterval(checkInterval);
          resolve({ success: true });
        }
      }, 100);
    });
  }

  pyodideLoading = true;

  try {
    // Load Pyodide from CDN
    if (!window.loadPyodide) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Pyodide script'));
        document.head.appendChild(script);
      });
    }

    // Initialize Pyodide
    pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.0/full/',
    });

    pyodideLoaded = true;
    pyodideLoading = false;
    return { success: true };
  } catch (error) {
    console.error('Failed to load Pyodide:', error);
    pyodideLoading = false;
    return { success: false, error: error.message };
  }
}

/**
 * Execute JavaScript code in the browser
 * @param {string} code - JavaScript code to execute
 * @returns {Promise<{output: string, error: boolean}>}
 */
export async function executeJavaScript(code) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        output: 'Error: Code execution timeout (5 seconds exceeded)',
        error: true,
      });
    }, 5000);

    try {
      // Capture console output
      const logs = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push(args.map((arg) => String(arg)).join(' '));
      };

      console.error = (...args) => {
        logs.push('ERROR: ' + args.map((arg) => String(arg)).join(' '));
      };

      // Execute code
      // eslint-disable-next-line no-eval
      const result = eval(code);

      // Restore console
      console.log = originalLog;
      console.error = originalError;

      clearTimeout(timeout);

      // Return result or logs
      if (result !== undefined && result !== null) {
        logs.push(`Result: ${String(result)}`);
      }

      resolve({
        output: logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)',
        error: false,
      });
    } catch (error) {
      console.log = console.log;
      console.error = console.error;
      clearTimeout(timeout);

      resolve({
        output: `Error: ${error.message}`,
        error: true,
      });
    }
  });
}

/**
 * Execute Python code in the browser using Pyodide WASM
 * @param {string} code - Python code to execute
 * @returns {Promise<{output: string, error: boolean}>}
 */
export async function executePython(code) {
  return new Promise(async (resolve) => {
    if (!pyodideLoaded) {
      const initResult = await initializePyodide();
      if (!initResult.success) {
        return resolve({
          output: `Error: Could not initialize Python runtime - ${initResult.error}`,
          error: true,
        });
      }
    }

    const timeout = setTimeout(() => {
      resolve({
        output: 'Error: Code execution timeout (5 seconds exceeded)',
        error: true,
      });
    }, 5000);

    try {
      // Capture output using Python's StringIO
      const pythonCode = `
import sys
from io import StringIO
import traceback

# Redirect stdout
output_buffer = StringIO()
original_stdout = sys.stdout
sys.stdout = output_buffer

try:
    ${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    sys.stdout = original_stdout
    print(f"Error: {str(e)}")
    traceback.print_exc()
finally:
    result = output_buffer.getvalue()
    sys.stdout = original_stdout

result
`;

      const result = await pyodide.runPythonAsync(pythonCode);

      clearTimeout(timeout);

      resolve({
        output: result || 'Python code executed successfully (no output)',
        error: false,
      });
    } catch (error) {
      clearTimeout(timeout);

      resolve({
        output: `Error: ${error.message}`,
        error: true,
      });
    }
  });
}

/**
 * Execute code based on language
 * @param {string} code - Code to execute
 * @param {string} language - Programming language (javascript, python, etc.)
 * @returns {Promise<{output: string, error: boolean}>}
 */
export async function executeCode(code, language) {
  // Validate code length to prevent abuse
  if (code.length > 100000) {
    return {
      output: 'Error: Code exceeds maximum length (100KB)',
      error: true,
    };
  }

  switch (language.toLowerCase()) {
    case 'javascript':
      return executeJavaScript(code);

    case 'python':
      return executePython(code);

    case 'java':
    case 'csharp':
    case 'ruby':
      return {
        output: `Error: ${language} execution not yet supported in browser. Supported: JavaScript, Python`,
        error: true,
      };

    default:
      return {
        output: `Error: Unknown language: ${language}`,
        error: true,
      };
  }
}

/**
 * Preload Pyodide in the background for faster first execution
 */
export function preloadPyodide() {
  if (!pyodideLoaded) {
    initializePyodide().catch((error) =>
      console.warn('Background Pyodide preload failed:', error)
    );
  }
}
