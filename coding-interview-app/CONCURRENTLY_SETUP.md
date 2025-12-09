# Running Both Services with Concurrently

## Quick Start

From the root directory (`/workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app`), run:

```bash
npm run dev
```

This single command will:
- ✅ Start the backend on http://localhost:5000
- ✅ Start the frontend on http://localhost:3000
- ✅ Both automatically reload on code changes
- ✅ Both run in the same terminal with color-coded output

## What's Available

### Development (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Individual Commands
```bash
npm run backend       # Backend only (production)
npm run backend:dev   # Backend only (development)
npm run frontend      # Frontend only
npm run build         # Build frontend for production
```

### Docker
```bash
npm run docker        # Run with Docker Compose
npm run docker:build  # Build Docker images
```

## Output Format

When running `npm run dev`, you'll see color-coded output:

```
[0] Backend output (labeled with [0])
[1] Frontend output (labeled with [1])
```

You can see both services running in real-time in a single terminal!

## Stopping Both Services

Press `Ctrl+C` to stop both services simultaneously.

## How It Works

The root `package.json` uses the `concurrently` package to run multiple npm scripts in parallel. This makes development much faster and easier!

## Benefits

✅ Single command to start everything  
✅ Color-coded output for each service  
✅ Auto-reload on code changes  
✅ Easy to see errors from both services  
✅ Faster feedback loop  
✅ Professional development workflow  

That's it! Happy coding! 🚀
