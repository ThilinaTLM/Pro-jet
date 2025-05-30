# Main Process Architecture

This document describes the refactored main process architecture for the Electron application.

## Overview

The main process has been restructured to improve code organization, maintainability, cross-platform compatibility, and debugging capabilities.

## Directory Structure

```
src/main/
├── config/
│   └── defaults.ts          # Platform-specific default configurations
├── handlers/
│   └── ipc-handlers.ts      # Organized IPC event handlers
├── services/
│   ├── launcher.ts          # External application launcher service
│   └── store.ts             # Data persistence service
├── utils/
│   ├── logger.ts            # Centralized logging utility
│   └── platform.ts         # Cross-platform utilities
├── index.ts                 # Main application entry point
└── README.md               # This documentation
```

## Key Components

### 1. Logger (`utils/logger.ts`)

- Centralized logging system with multiple log levels
- File-based logging for production debugging
- Colored console output for development
- Automatic log file rotation by date
- Context-aware logging for better debugging

**Usage:**

```typescript
import { logger } from './utils/logger'

logger.info('Application started', 'ComponentName')
logger.error('Something went wrong', 'ComponentName', errorObject)
```

### 2. Platform Utils (`utils/platform.ts`)

- Cross-platform detection and utilities
- Platform-specific path handling
- Command normalization for different operating systems
- Platform information logging

**Features:**

- Windows, macOS, and Linux detection
- Executable extension handling
- Path separator normalization
- Platform-specific command adjustments

### 3. Defaults Manager (`config/defaults.ts`)

- Platform-specific default configurations
- Configuration validation and auto-fixing
- Supported application detection
- Fallback configuration management

**Features:**

- Automatic platform detection
- Editor and terminal defaults per platform
- Configuration validation with detailed error reporting
- Auto-fix for invalid configurations

### 4. Launcher Service (`services/launcher.ts`)

- External application launching with fallbacks
- Command existence validation
- Cross-platform terminal and editor support
- Detailed error reporting and logging

**Supported Applications:**

- **Editors:** Cursor, VS Code, IntelliJ IDEA
- **Terminals:** Platform-specific terminal applications
- **Fallbacks:** Multiple command variants per application

### 5. Store Service (`services/store.ts`)

- Enhanced data persistence with validation
- Automatic configuration migration
- Repository management with duplicate detection
- Theme and editor configuration management

**Features:**

- Schema validation
- Data sanitization
- Automatic backups
- Configuration auto-fixing

### 6. IPC Handlers (`handlers/ipc-handlers.ts`)

- Organized IPC event handling
- Comprehensive error handling
- Service integration
- Request/response logging

**Handler Categories:**

- Store operations (repos, theme, editors)
- Application management (window, directory selection)
- Launcher operations (editors, terminals)

## Cross-Platform Support

### Windows

- Windows Terminal, Command Prompt, PowerShell support
- .exe extension handling
- Windows-specific path handling
- Registry-based application detection

### macOS

- Terminal.app, iTerm2, and other terminal support
- Application bundle handling
- macOS-specific window styling
- Spotlight integration ready

### Linux

- Multiple terminal emulator support
- Desktop environment detection
- Package manager integration ready
- XDG standards compliance

## Configuration Management

### Default Configurations

The system automatically detects the platform and provides appropriate defaults:

```typescript
// Windows defaults
{
  cursor: 'cursor',
  vscode: 'code',
  idea: 'idea64',
  terminal: ['wt', 'cmd', 'powershell']
}

// macOS defaults
{
  cursor: 'cursor',
  vscode: 'code',
  idea: 'idea',
  terminal: ['open -a Terminal', 'open -a iTerm']
}

// Linux defaults
{
  cursor: 'cursor',
  vscode: 'code',
  idea: 'idea',
  terminal: ['gnome-terminal', 'konsole', 'xfce4-terminal']
}
```

### Auto-Detection and Validation

- Validates editor and terminal commands on startup
- Auto-fixes invalid configurations
- Provides fallback options
- Logs configuration issues for debugging

## Error Handling

### Comprehensive Error Handling

- All services include try-catch blocks
- Detailed error logging with context
- Graceful degradation for missing applications
- User-friendly error messages

### Logging Levels

- **DEBUG:** Detailed execution flow
- **INFO:** General application events
- **WARN:** Non-critical issues
- **ERROR:** Critical errors requiring attention

## Development vs Production

### Development Mode

- Enhanced logging with colors
- Console output for immediate feedback
- Debug-level logging enabled
- Hot reload support

### Production Mode

- File-based logging only
- Optimized log levels
- Error reporting ready
- Performance optimized

## Migration from Old Architecture

### What Changed

1. **Monolithic files split** into focused services
2. **Platform detection** centralized and improved
3. **Error handling** standardized across all components
4. **Logging** centralized with context awareness
5. **Configuration** validation and auto-fixing added

### Benefits

- **Maintainability:** Clear separation of concerns
- **Testability:** Each service can be tested independently
- **Debugging:** Comprehensive logging and error reporting
- **Cross-platform:** Better platform-specific handling
- **Reliability:** Validation and auto-fixing prevent crashes

## Future Enhancements

### Planned Features

- Configuration UI for editor/terminal preferences
- Application auto-detection and suggestion
- Plugin system for custom launchers
- Performance monitoring and metrics
- Automated testing framework

### Extension Points

- Custom launcher implementations
- Additional platform support
- Third-party editor integration
- Cloud configuration sync

## Troubleshooting

### Common Issues

1. **Application not launching:** Check logs for command validation errors
2. **Configuration reset:** Auto-fix system will restore defaults
3. **Platform detection issues:** Logs will show detected platform info
4. **Permission errors:** Check application installation and PATH

### Log Locations

- **Development:** Console output + log files
- **Production:** `{userData}/logs/app-{date}.log`
- **Log rotation:** Daily log files with automatic cleanup

### Debug Mode

Enable debug logging by setting the log level:

```typescript
import { logger, LogLevel } from './utils/logger'
logger.setLogLevel(LogLevel.DEBUG)
```
