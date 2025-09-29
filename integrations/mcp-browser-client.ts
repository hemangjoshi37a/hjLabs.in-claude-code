import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface MCPBrowserConfig {
  serverType: 'playwright' | 'puppeteer';
  headless: boolean;
  browser: 'chromium' | 'firefox' | 'webkit' | 'chrome';
  viewport: { width: number; height: number };
  timeout: number;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface PageElement {
  selector: string;
  tagName: string;
  text: string;
  attributes: Record<string, string>;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  isClickable: boolean;
}

export class MCPBrowserClient {
  private mcpProcess: ChildProcess | null = null;
  private config: MCPBrowserConfig;
  private requestId = 1;
  private screenshotDir: string;

  constructor(config: Partial<MCPBrowserConfig> = {}) {
    this.config = {
      serverType: 'playwright',
      headless: false,
      browser: 'chromium',
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
      ...config
    };

    this.screenshotDir = join(process.cwd(), '.claude', 'screenshots');
  }

  /**
   * Initialize MCP browser server
   */
  async initialize(): Promise<{ success: boolean; server: string; error?: string }> {
    console.log('🚀 Initializing MCP Browser Client...');
    console.log(`   📋 Config: ${this.config.serverType}, ${this.config.browser}, headless: ${this.config.headless}`);

    try {
      // Try to start the preferred MCP server
      const serverStarted = await this.startMCPServer();

      if (serverStarted) {
        // Initialize browser session
        const browserInit = await this.sendMCPRequest('browser/initialize', {
          browser: this.config.browser,
          headless: this.config.headless,
          viewport: this.config.viewport,
          timeout: this.config.timeout
        });

        if (browserInit.error) {
          console.log(`   ❌ Failed to initialize browser: ${browserInit.error.message}`);
          return { success: false, server: this.config.serverType, error: browserInit.error.message };
        }

        console.log('   ✅ MCP Browser Client initialized successfully');
        return { success: true, server: this.config.serverType };
      } else {
        return { success: false, server: this.config.serverType, error: 'Failed to start MCP server' };
      }

    } catch (error) {
      console.log(`   ❌ Initialization failed: ${error.message}`);
      return { success: false, server: this.config.serverType, error: error.message };
    }
  }

  /**
   * Start the appropriate MCP server
   */
  private async startMCPServer(): Promise<boolean> {
    const servers = [
      {
        name: 'Microsoft Playwright MCP',
        package: '@playwright/mcp',
        command: 'npx',
        args: ['@playwright/mcp', '--stdio']
      },
      {
        name: 'ExecuteAutomation Playwright MCP',
        package: '@executeautomation/playwright-mcp-server',
        command: 'npx',
        args: ['-y', '@executeautomation/playwright-mcp-server']
      },
      {
        name: 'Official Puppeteer MCP',
        package: '@modelcontextprotocol/server-puppeteer',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer', '--stdio']
      }
    ];

    for (const server of servers) {
      console.log(`   🔄 Trying ${server.name}...`);

      try {
        this.mcpProcess = spawn(server.command, server.args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, NODE_ENV: 'production' }
        });

        // Test if server starts successfully
        const started = await this.testServerConnection();

        if (started) {
          console.log(`   ✅ ${server.name} started successfully`);
          return true;
        } else {
          console.log(`   ⚠️ ${server.name} failed to start, trying next...`);
          this.mcpProcess?.kill();
          this.mcpProcess = null;
        }

      } catch (error) {
        console.log(`   ❌ ${server.name} error: ${error.message}`);
        continue;
      }
    }

    console.log('   ❌ All MCP servers failed to start');
    return false;
  }

  /**
   * Test server connection
   */
  private async testServerConnection(): Promise<boolean> {
    if (!this.mcpProcess) return false;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      this.mcpProcess!.stdout?.once('data', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.mcpProcess!.stderr?.once('data', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      // Send a test ping
      this.sendMCPRequest('ping', {}).catch(() => {});
    });
  }

  /**
   * Send request to MCP server
   */
  async sendMCPRequest(method: string, params: any = {}): Promise<MCPResponse> {
    if (!this.mcpProcess) {
      throw new Error('MCP server not initialized');
    }

    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const requestStr = JSON.stringify(request) + '\n';

      // Set up response handler
      const responseHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString()) as MCPResponse;
          if (response.id === request.id) {
            this.mcpProcess!.stdout!.off('data', responseHandler);
            resolve(response);
          }
        } catch (error) {
          // Invalid JSON, might be partial data
        }
      };

      this.mcpProcess!.stdout!.on('data', responseHandler);

      // Set timeout
      const timeout = setTimeout(() => {
        this.mcpProcess!.stdout!.off('data', responseHandler);
        reject(new Error(`MCP request timeout: ${method}`));
      }, this.config.timeout);

      // Send request
      this.mcpProcess!.stdin!.write(requestStr, (error) => {
        if (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }

  /**
   * Navigate to URL
   */
  async navigate(url: string): Promise<{ success: boolean; title?: string; error?: string }> {
    console.log(`🌐 Navigating to: ${url}`);

    try {
      const response = await this.sendMCPRequest('browser/navigate', { url });

      if (response.error) {
        console.log(`   ❌ Navigation failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Navigation successful`);
      return { success: true, title: response.result?.title };

    } catch (error) {
      console.log(`   ❌ Navigation error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string = 'screenshot'): Promise<{ success: boolean; path?: string; error?: string }> {
    console.log(`📸 Taking screenshot: ${name}`);

    try {
      const response = await this.sendMCPRequest('browser/screenshot', {
        fullPage: true,
        quality: 80
      });

      if (response.error) {
        console.log(`   ❌ Screenshot failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      // Save screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}.png`;
      const filepath = join(this.screenshotDir, filename);

      if (response.result?.data) {
        const imageData = Buffer.from(response.result.data, 'base64');
        writeFileSync(filepath, imageData);
        console.log(`   ✅ Screenshot saved: ${filename}`);
        return { success: true, path: filepath };
      } else {
        return { success: false, error: 'No screenshot data received' };
      }

    } catch (error) {
      console.log(`   ❌ Screenshot error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Click element by selector
   */
  async click(selector: string): Promise<{ success: boolean; error?: string }> {
    console.log(`👆 Clicking element: ${selector}`);

    try {
      const response = await this.sendMCPRequest('browser/click', { selector });

      if (response.error) {
        console.log(`   ❌ Click failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Click successful`);
      return { success: true };

    } catch (error) {
      console.log(`   ❌ Click error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Type text into element
   */
  async type(selector: string, text: string): Promise<{ success: boolean; error?: string }> {
    console.log(`⌨️ Typing "${text}" into: ${selector}`);

    try {
      const response = await this.sendMCPRequest('browser/type', { selector, text });

      if (response.error) {
        console.log(`   ❌ Typing failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Typing successful`);
      return { success: true };

    } catch (error) {
      console.log(`   ❌ Typing error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get page elements
   */
  async getElements(selector: string = '*'): Promise<{ success: boolean; elements?: PageElement[]; error?: string }> {
    console.log(`🔍 Getting elements: ${selector}`);

    try {
      const response = await this.sendMCPRequest('browser/elements', { selector });

      if (response.error) {
        console.log(`   ❌ Get elements failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Found ${response.result?.elements?.length || 0} elements`);
      return { success: true, elements: response.result?.elements || [] };

    } catch (error) {
      console.log(`   ❌ Get elements error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Evaluate JavaScript
   */
  async evaluate(script: string): Promise<{ success: boolean; result?: any; error?: string }> {
    console.log(`🔧 Evaluating JavaScript: ${script.substring(0, 50)}...`);

    try {
      const response = await this.sendMCPRequest('browser/evaluate', { script });

      if (response.error) {
        console.log(`   ❌ Evaluation failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Evaluation successful`);
      return { success: true, result: response.result };

    } catch (error) {
      console.log(`   ❌ Evaluation error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Wait for element
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<{ success: boolean; error?: string }> {
    console.log(`⏳ Waiting for element: ${selector}`);

    try {
      const response = await this.sendMCPRequest('browser/waitForSelector', { selector, timeout });

      if (response.error) {
        console.log(`   ❌ Wait failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Element found`);
      return { success: true };

    } catch (error) {
      console.log(`   ❌ Wait error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Scroll page
   */
  async scroll(direction: 'up' | 'down' | 'left' | 'right', amount: number = 500): Promise<{ success: boolean; error?: string }> {
    console.log(`📜 Scrolling ${direction} by ${amount}px`);

    try {
      const response = await this.sendMCPRequest('browser/scroll', { direction, amount });

      if (response.error) {
        console.log(`   ❌ Scroll failed: ${response.error.message}`);
        return { success: false, error: response.error.message };
      }

      console.log(`   ✅ Scroll successful`);
      return { success: true };

    } catch (error) {
      console.log(`   ❌ Scroll error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get page title and URL
   */
  async getPageInfo(): Promise<{ success: boolean; title?: string; url?: string; error?: string }> {
    try {
      const response = await this.sendMCPRequest('browser/pageInfo', {});

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return {
        success: true,
        title: response.result?.title,
        url: response.result?.url
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    console.log('🚪 Closing browser...');

    try {
      if (this.mcpProcess) {
        await this.sendMCPRequest('browser/close', {});
        this.mcpProcess.kill();
        this.mcpProcess = null;
        console.log('   ✅ Browser closed successfully');
      }
    } catch (error) {
      console.log(`   ⚠️ Error closing browser: ${error.message}`);
    }
  }

  /**
   * Smart element selection using text or description
   */
  async findElementByDescription(description: string): Promise<{ success: boolean; selector?: string; error?: string }> {
    console.log(`🔍 Finding element by description: "${description}"`);

    try {
      // Get all interactive elements
      const elementsResponse = await this.getElements('button, a, input, select, textarea, [onclick], [role="button"]');

      if (!elementsResponse.success || !elementsResponse.elements) {
        return { success: false, error: 'Could not get page elements' };
      }

      // Find best match based on text content or attributes
      const elements = elementsResponse.elements;
      const lowerDescription = description.toLowerCase();

      for (const element of elements) {
        const elementText = element.text.toLowerCase();
        const elementType = element.tagName.toLowerCase();

        // Check if description matches text content
        if (elementText.includes(lowerDescription) || lowerDescription.includes(elementText)) {
          console.log(`   ✅ Found element by text match: ${element.selector}`);
          return { success: true, selector: element.selector };
        }

        // Check if description matches element type and attributes
        if (lowerDescription.includes(elementType)) {
          const hasRelevantAttribute = Object.entries(element.attributes).some(([key, value]) =>
            lowerDescription.includes(value.toLowerCase())
          );

          if (hasRelevantAttribute) {
            console.log(`   ✅ Found element by type and attribute: ${element.selector}`);
            return { success: true, selector: element.selector };
          }
        }
      }

      // If no exact match, return the first clickable element
      const clickableElement = elements.find(el => el.isClickable);
      if (clickableElement) {
        console.log(`   ⚠️ No exact match, using first clickable element: ${clickableElement.selector}`);
        return { success: true, selector: clickableElement.selector };
      }

      return { success: false, error: `No element found matching: "${description}"` };

    } catch (error) {
      console.log(`   ❌ Element search error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Smart click using description
   */
  async clickByDescription(description: string): Promise<{ success: boolean; error?: string }> {
    const elementResult = await this.findElementByDescription(description);

    if (!elementResult.success || !elementResult.selector) {
      return { success: false, error: elementResult.error };
    }

    return await this.click(elementResult.selector);
  }

  /**
   * Smart type using description
   */
  async typeByDescription(description: string, text: string): Promise<{ success: boolean; error?: string }> {
    const elementResult = await this.findElementByDescription(description);

    if (!elementResult.success || !elementResult.selector) {
      return { success: false, error: elementResult.error };
    }

    return await this.type(elementResult.selector, text);
  }
}

export const mcpBrowserClient = new MCPBrowserClient();