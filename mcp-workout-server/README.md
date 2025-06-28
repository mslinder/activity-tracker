# Workout MCP Server

A Model Context Protocol (MCP) server for managing workouts in the activity tracker application.

## Features

- **create_workout**: Create new workouts with exercises and validation
- **validate_workout**: Validate workout data structure without saving
- **list_workouts**: List existing workouts with optional date filtering
- **get_workout**: Get specific workout by ID or date

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

3. Configure Firebase credentials (optional for development):
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

## Configuration for Claude Desktop

Add this to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "workout": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-workout-server/build/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
      }
    }
  }
}
```

## Development

Run in development mode:
```bash
npm run dev
```

## Tools

### create_workout
Creates a new workout with validation.

**Example:**
```json
{
  "name": "Push Day",
  "date": "2025-06-28",
  "exercises": [
    {
      "name": "Bench Press",
      "description": "Chest exercise with barbell",
      "order": 1,
      "planned": {
        "sets": [8, 8, 6],
        "unit": "reps",
        "weight": {
          "amount": 135,
          "unit": "lb"
        },
        "equipment": "Barbell"
      }
    }
  ]
}
```

### validate_workout
Validates workout structure without saving.

### list_workouts
Lists existing workouts, optionally filtered by date range.

**Example:**
```json
{
  "startDate": "2025-06-01",
  "endDate": "2025-06-30"
}
```

### get_workout
Gets a specific workout by ID or date.

**Example:**
```json
{
  "identifier": "2025-06-28"
}
```