# Pro-jet

A modern workspace management tool built with Electron, React, and TypeScript that helps developers organize and quickly access their coding projects.

## ✨ Features

- **Project Directory Management**: Add, organize, and manage your coding project directories
- **Quick Access**: Instantly open projects in your preferred editor or terminal
- **Multi-Editor Support**: Seamlessly integrate with popular editors:
  - Cursor
  - Visual Studio Code
  - IntelliJ IDEA
- **Terminal Integration**: Launch projects directly in your preferred terminal emulator
- **Theme Support**: Choose between light, dark, or system theme
- **Modern UI**: Clean and intuitive interface built with Tailwind CSS and Radix UI
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🛠️ Tech Stack

- **Framework**: Electron with React 19
- **Language**: TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Build Tool**: Vite with electron-vite
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Building for Production

```bash
# For Windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## 📁 Project Structure

- `src/main/` - Electron main process
- `src/renderer/` - React frontend application
- `src/preload/` - Electron preload scripts
- `src/common/` - Shared types and utilities

## 🎯 Usage

1. **Add Projects**: Click the "+" button to add project directories to your workspace
2. **Quick Open**: Click on any project to open it in your default editor
3. **Context Actions**: Right-click projects for additional options (open in terminal, different editors, etc.)
4. **Settings**: Configure your preferred editors and terminal emulators in the settings panel
5. **Themes**: Switch between light, dark, or system theme to match your preference

## 👨‍💻 Author

**Thilina Lakshan**

## 📄 License

This project is licensed under the MIT License.

---

_Pro-jet - Streamline your development workflow with organized project management._
