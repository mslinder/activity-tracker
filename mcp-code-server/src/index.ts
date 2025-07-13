#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import ignore from 'ignore';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

class CodeExplorerServer {
  private server: Server;
  private gitignore: ReturnType<typeof ignore> = ignore();

  constructor() {
    this.server = new Server(
      {
        name: 'activity-tracker-code-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupErrorHandling();
    this.setupTools();
    this.loadGitignore();
  }

  private loadGitignore() {
    try {
      const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        this.gitignore.add(gitignoreContent);
      }
      // Always ignore common development files
      this.gitignore.add([
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        '*.log',
        '.DS_Store',
        '.env*'
      ]);
    } catch (error) {
      console.error('Error loading .gitignore:', error);
    }
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_file',
          description: 'Read contents of a file in the project',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Relative path from project root',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'list_files',
          description: 'List files in a directory with optional pattern matching',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Directory to list (relative to project root)',
                default: '.',
              },
              pattern: {
                type: 'string',
                description: 'Glob pattern to filter files (e.g., "**/*.ts")',
              },
              include_content: {
                type: 'boolean',
                description: 'Include file contents for small files',
                default: false,
              },
            },
          },
        },
        {
          name: 'search_code',
          description: 'Search for text patterns in code files',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Text to search for',
              },
              file_pattern: {
                type: 'string',
                description: 'File pattern to search in (e.g., "**/*.ts")',
                default: '**/*.{ts,tsx,js,jsx}',
              },
              case_sensitive: {
                type: 'boolean',
                description: 'Case sensitive search',
                default: false,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_project_structure',
          description: 'Get overview of project structure and key files',
          inputSchema: {
            type: 'object',
            properties: {
              max_depth: {
                type: 'number',
                description: 'Maximum directory depth to show',
                default: 3,
              },
            },
          },
        },
        {
          name: 'analyze_component',
          description: 'Analyze a React component and its dependencies',
          inputSchema: {
            type: 'object',
            properties: {
              component_path: {
                type: 'string',
                description: 'Path to the component file',
              },
            },
            required: ['component_path'],
          },
        },
      ] as Tool[],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'read_file':
            return await this.readFile(request.params.arguments?.path as string);
          case 'list_files':
            return await this.listFiles(
              request.params.arguments?.directory as string,
              request.params.arguments?.pattern as string,
              request.params.arguments?.include_content as boolean
            );
          case 'search_code':
            return await this.searchCode(
              request.params.arguments?.query as string,
              request.params.arguments?.file_pattern as string,
              request.params.arguments?.case_sensitive as boolean
            );
          case 'get_project_structure':
            return await this.getProjectStructure(
              request.params.arguments?.max_depth as number
            );
          case 'analyze_component':
            return await this.analyzeComponent(
              request.params.arguments?.component_path as string
            );
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async readFile(relativePath: string) {
    const fullPath = path.resolve(PROJECT_ROOT, relativePath);
    
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      throw new Error('Access denied: Path outside project root');
    }

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${relativePath}`);
    }

    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      throw new Error(`Path is a directory, not a file: ${relativePath}`);
    }

    // Check file size (limit to 1MB)
    if (stat.size > 1024 * 1024) {
      throw new Error(`File too large: ${relativePath} (${stat.size} bytes)`);
    }

    const content = await fs.readFile(fullPath, 'utf8');
    return {
      content: [
        {
          type: 'text',
          text: `File: ${relativePath}\n\n${content}`,
        },
      ],
    };
  }

  private async listFiles(directory = '.', pattern?: string, includeContent = false) {
    const fullDir = path.resolve(PROJECT_ROOT, directory);
    
    if (!fullDir.startsWith(PROJECT_ROOT)) {
      throw new Error('Access denied: Path outside project root');
    }

    const searchPattern = pattern || '**/*';
    const searchPath = path.join(fullDir, searchPattern);
    
    const files = await glob(searchPattern, {
      cwd: fullDir,
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
    });

    const filteredFiles = this.gitignore.filter(files);
    
    let result = `Files in ${directory}:\n\n`;
    
    for (const file of filteredFiles.slice(0, 50)) { // Limit results
      const fullPath = path.join(fullDir, file);
      const stat = await fs.stat(fullPath);
      
      if (stat.isFile()) {
        result += `📄 ${file}`;
        
        if (includeContent && stat.size < 1024) { // Only small files
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            result += `\n   Content: ${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`;
          } catch (error) {
            result += `\n   (Error reading file)`;
          }
        }
        result += '\n';
      } else if (stat.isDirectory()) {
        result += `📁 ${file}/\n`;
      }
    }

    return {
      content: [{ type: 'text', text: result }],
    };
  }

  private async searchCode(query: string, filePattern = '**/*.{ts,tsx,js,jsx}', caseSensitive = false) {
    const files = await glob(filePattern, {
      cwd: PROJECT_ROOT,
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
    });

    const filteredFiles = this.gitignore.filter(files);
    const results: string[] = [];
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);

    for (const file of filteredFiles) {
      const fullPath = path.join(PROJECT_ROOT, file);
      try {
        const content = await fs.readFile(fullPath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            results.push(`${file}:${index + 1}: ${line.trim()}`);
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: results.length > 0 
            ? `Search results for "${query}":\n\n${results.slice(0, 100).join('\n')}`
            : `No matches found for "${query}"`,
        },
      ],
    };
  }

  private async getProjectStructure(maxDepth = 3) {
    const structure = await this.buildDirectoryTree(PROJECT_ROOT, '', 0, maxDepth);
    
    return {
      content: [
        {
          type: 'text',
          text: `Activity Tracker Project Structure:\n\n${structure}`,
        },
      ],
    };
  }

  private async buildDirectoryTree(dirPath: string, prefix: string, currentDepth: number, maxDepth: number): Promise<string> {
    if (currentDepth >= maxDepth) return '';
    
    let result = '';
    try {
      const items = await fs.readdir(dirPath);
      const filteredItems = this.gitignore.filter(items.map(item => 
        path.relative(PROJECT_ROOT, path.join(dirPath, item))
      )).map(item => path.basename(item));

      for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i];
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        const isLast = i === filteredItems.length - 1;
        const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');

        result += currentPrefix + item;
        
        if (stat.isDirectory()) {
          result += '/\n';
          result += await this.buildDirectoryTree(itemPath, nextPrefix, currentDepth + 1, maxDepth);
        } else {
          result += '\n';
        }
      }
    } catch (error) {
      result += `${prefix}(Error reading directory)\n`;
    }
    
    return result;
  }

  private async analyzeComponent(componentPath: string) {
    const fullPath = path.resolve(PROJECT_ROOT, componentPath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Component not found: ${componentPath}`);
    }

    const content = await fs.readFile(fullPath, 'utf8');
    
    // Basic analysis
    const imports = content.match(/import.*from.*['"]([^'"]+)['"]/g) || [];
    const exports = content.match(/export.*(?:function|const|class)\s+(\w+)/g) || [];
    const hooks = content.match(/use[A-Z]\w+/g) || [];
    const propsInterface = content.match(/interface\s+(\w+Props)/g) || [];
    
    let analysis = `Component Analysis: ${componentPath}\n\n`;
    analysis += `📦 Imports (${imports.length}):\n${imports.map(imp => `  ${imp}`).join('\n')}\n\n`;
    analysis += `📤 Exports (${exports.length}):\n${exports.map(exp => `  ${exp}`).join('\n')}\n\n`;
    analysis += `🪝 Hooks used (${hooks.length}):\n${[...new Set(hooks)].map(hook => `  ${hook}`).join('\n')}\n\n`;
    analysis += `🔧 Props interfaces (${propsInterface.length}):\n${propsInterface.map(prop => `  ${prop}`).join('\n')}\n\n`;
    
    // File size and complexity
    const lines = content.split('\n').length;
    const complexity = (content.match(/if|for|while|switch|catch|\?|&&|\|\|/g) || []).length;
    analysis += `📊 Metrics:\n  Lines: ${lines}\n  Complexity indicators: ${complexity}\n\n`;
    
    return {
      content: [{ type: 'text', text: analysis }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Activity Tracker Code Server running on stdio');
  }
}

const server = new CodeExplorerServer();
server.run().catch(console.error);