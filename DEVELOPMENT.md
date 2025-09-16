# Development Setup

## Prerequisites

- Node.js 18+ 
- npm or bun
- MongoDB instance
- Discord Developer Account

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Build and test:**
   ```bash
   npm run build
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run lint` - Run ESLint code quality checks
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── commands/        # Discord slash commands (future)
├── events/          # Discord event handlers (future)
├── config/          # Environment and app configuration
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── logger.ts    # Logging system
│   ├── errorHandler.ts  # Error handling utilities
│   └── botClient.ts # Discord bot client wrapper
└── index.ts         # Main application entry point
```

## Configuration

### Environment Variables

Required:
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `DISCORD_CLIENT_ID` - Application ID from Discord Developer Portal  
- `MONGODB_URI` - MongoDB connection string

Optional:
- `GUILD_ID` - Test guild ID for development
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (error/warn/info/debug)
- `COMMAND_PREFIX` - Command prefix (default: /)

### Discord Bot Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to "Bot" section
4. Create a bot user
5. Copy the token to your `.env` file
6. Enable necessary intents (Guilds, Guild Messages, Message Content)

### MongoDB Setup

For development, you can use:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker container: `docker run -d -p 27017:27017 mongo`

## Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run dev` for hot reload during development
3. Run `npm run lint` to check code quality
4. Run `npm run build` to compile for production
5. Test changes with verification script

## Current Implementation Status

✅ **Section 1.1 Complete - Project Setup & Infrastructure:**
- Node.js/TypeScript project structure
- Environment configuration system
- Comprehensive logging with file and console output
- Error handling with graceful shutdown
- Discord bot client wrapper
- Development and production environment setup
- Code quality tools (ESLint, Prettier)
- Build and development scripts

🚧 **Next: Section 1.2 - Basic Match Creation**

## Troubleshooting

### Build Issues
- Ensure TypeScript version compatibility
- Check all dependencies are installed
- Verify tsconfig.json settings

### Discord Connection Issues  
- Verify bot token is correct
- Check bot permissions in Discord
- Ensure intents are enabled

### Database Issues
- Verify MongoDB URI is correct
- Check MongoDB service is running
- Test connection string manually