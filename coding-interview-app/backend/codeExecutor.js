/**
 * Backend Code Execution Module
 * 
 * Handles safe code execution with various sandboxing options
 * For production, use Judge0, Piston, or Docker containers
 */

class CodeExecutor {
  constructor() {
    this.timeout = 5000; // 5 seconds
    this.maxOutputLength = 10000; // Max output size
  }

  /**
   * Execute JavaScript code server-side
   * WARNING: Only for trusted code. Never use for untrusted user input.
   */
  async executeJavaScript(code) {
    return new Promise((resolve, reject) => {
      const logs = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };

      console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      };

      const timeoutId = setTimeout(() => {
        console.log = originalLog;
        console.error = originalError;
        reject(new Error('Execution timeout'));
      }, this.timeout);

      try {
        Function(code)();

        clearTimeout(timeoutId);
        console.log = originalLog;
        console.error = originalError;

        const output = logs.join('\n').substring(0, this.maxOutputLength);
        resolve({ output: output || 'Code executed successfully' });
      } catch (error) {
        clearTimeout(timeoutId);
        console.log = originalLog;
        console.error = originalError;

        reject(new Error(`Runtime error: ${error.message}`));
      }
    });
  }

  /**
   * Validate code before execution
   */
  validateCode(code, language) {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /require\s*\(\s*['"]fs['"]\s*\)/,  // File system access
      /require\s*\(\s*['"]child_process['"]\s*\)/,  // Process spawning
      /require\s*\(\s*['"]os['"]\s*\)/,  // OS access
      /import\s+.*\s+from\s+['"]fs['"]/,  // ES6 file system
      /eval\s*\(/,  // Dynamic code execution
      /exec\s*\(/,  // Command execution
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(code)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get language support info
   */
  getSupportedLanguages() {
    return [
      'javascript',
      'python',
      'java',
      'cpp',
      'csharp',
      'ruby'
    ];
  }
}

module.exports = new CodeExecutor();
