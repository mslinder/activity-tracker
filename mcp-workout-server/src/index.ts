#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createWorkout } from './tools/createWorkout.js';
import { validateWorkout } from './tools/validateWorkout.js';
import { listWorkouts } from './tools/listWorkouts.js';
import { getWorkout } from './tools/getWorkout.js';

class WorkoutMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'workout-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_workout',
            description: 'Create a new workout with exercises. Validates the workout data before saving to Firebase.',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the workout (e.g., "Push Day", "Upper Body Strength")'
                },
                date: {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                  description: 'The date for the workout in YYYY-MM-DD format'
                },
                exercises: {
                  type: 'array',
                  description: 'Array of exercises for the workout',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Name of the exercise'
                      },
                      description: {
                        type: 'string',
                        description: 'Detailed description or instructions for the exercise'
                      },
                      order: {
                        type: 'number',
                        description: 'Order of the exercise in the workout (1, 2, 3, etc.)'
                      },
                      planned: {
                        type: 'object',
                        properties: {
                          sets: {
                            type: 'array',
                            items: { type: 'number' },
                            description: 'Array of planned reps/time for each set'
                          },
                          unit: {
                            type: 'string',
                            enum: ['reps', 'seconds', 'minutes'],
                            description: 'Unit for the sets (reps, seconds, or minutes)'
                          },
                          weight: {
                            type: 'object',
                            properties: {
                              amount: {
                                type: 'number',
                                description: 'Weight amount'
                              },
                              unit: {
                                type: 'string',
                                enum: ['lb', 'kg', 'bodyweight'],
                                description: 'Weight unit'
                              }
                            },
                            required: ['amount', 'unit']
                          },
                          equipment: {
                            type: 'string',
                            description: 'Equipment needed for the exercise'
                          }
                        },
                        required: ['sets', 'unit']
                      }
                    },
                    required: ['name', 'description', 'order', 'planned']
                  }
                }
              },
              required: ['name', 'date', 'exercises']
            }
          },
          {
            name: 'validate_workout',
            description: 'Validate workout data structure and business rules without saving to Firebase.',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                date: { type: 'string' },
                exercises: { type: 'array' }
              },
              required: ['name', 'date', 'exercises']
            }
          },
          {
            name: 'list_workouts',
            description: 'List existing workouts, optionally filtered by date range.',
            inputSchema: {
              type: 'object',
              properties: {
                startDate: {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                  description: 'Start date filter in YYYY-MM-DD format (optional)'
                },
                endDate: {
                  type: 'string',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                  description: 'End date filter in YYYY-MM-DD format (optional)'
                }
              }
            }
          },
          {
            name: 'get_workout',
            description: 'Get details of a specific workout by ID or date.',
            inputSchema: {
              type: 'object',
              properties: {
                identifier: {
                  type: 'string',
                  description: 'Workout ID or date in YYYY-MM-DD format'
                }
              },
              required: ['identifier']
            }
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_workout': {
            if (!args) throw new Error('Arguments required for create_workout');
            const result = await createWorkout(args as any);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'validate_workout': {
            const result = validateWorkout(args);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'list_workouts': {
            const typedArgs = args as { startDate?: string; endDate?: string } | undefined;
            const result = await listWorkouts(typedArgs?.startDate, typedArgs?.endDate);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'get_workout': {
            if (!args) throw new Error('Arguments required for get_workout');
            const typedArgs = args as { identifier: string };
            const result = await getWorkout(typedArgs.identifier);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Workout MCP Server running on stdio');
  }
}

const server = new WorkoutMCPServer();
server.run().catch(console.error);