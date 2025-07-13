# Activity Tracker Code Explorer MCP Server

An MCP server that provides Claude with direct access to your Activity Tracker codebase for code exploration, analysis, and questions.

## Features

- **File Reading**: Read any file in your project
- **Directory Listing**: Browse project structure
- **Code Search**: Search for patterns across your codebase
- **Component Analysis**: Analyze React components and their dependencies
- **Project Overview**: Get high-level project structure
- **Safe Access**: Respects .gitignore and prevents access outside project root

## Installation

```bash
cd mcp-code-server
npm install
npm run build
```

## Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "activity-tracker-workouts": {
      "command": "node",
      "args": ["/path/to/activity-tracker/mcp-workout-server/build/index.js"]
    },
    "activity-tracker-code": {
      "command": "node", 
      "args": ["/path/to/activity-tracker/mcp-code-server/build/index.js"]
    }
  }
}
```

## Available Tools

### `read_file`
Read contents of any file in the project.
```
read_file(path: "src/components/ExerciseTimer.tsx")
```

### `list_files` 
List files in a directory with optional pattern matching.
```
list_files(directory: "src/components", pattern: "**/*.tsx")
```

### `search_code`
Search for text patterns across your codebase.
```
search_code(query: "useState", file_pattern: "**/*.tsx")
```

### `get_project_structure`
Get an overview of your project structure.
```
get_project_structure(max_depth: 3)
```

### `analyze_component`
Analyze a React component and its dependencies.
```
analyze_component(component_path: "src/components/ExerciseTimer.tsx")
```

## Example Usage

Once configured, you can ask Claude:

- "What hooks are used in ExerciseTimer.tsx?"
- "Show me all files that import firebase"
- "How is the exercise service structured?"
- "What components use the useExerciseHooks?"
- "Analyze the App.tsx component"
- "Search for all instances of 'timestamp' in the codebase"

## Security

- Only accesses files within the project root
- Respects .gitignore patterns
- Limits file sizes to prevent memory issues
- No write access - read-only exploration

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Start the server
npm start
```