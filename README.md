# HR-WORKFLOW-DESIGNER

A modern, interactive **Automation Workflow Builder** designed for creating and managing HR workflows through an intuitive drag-and-drop interface.

## 📋 Overview

HR-WORKFLOW-DESIGNER is a full-stack web application that provides a visual workflow editor for designing, validating, and simulating complex HR processes. With support for multiple node types and graph-based workflow management, this tool enables users to build sophisticated automation workflows without writing code.

## ✨ Features

- **Drag-and-Drop Workflow Editor** - Intuitive visual interface for building workflows
- **Multiple Node Types** - Support for 5 different node types to model various workflow steps
- **Graph Validation** - Automatic validation of workflow structure and connections
- **Workflow Simulation** - Test and preview workflows before deployment
- **Real-time Updates** - Immediate visual feedback as you design workflows
- **Form-based Configuration** - Configure workflow nodes with detailed forms
- **Undo/Redo Support** - Full history management for workflow edits

## 🛠️ Tech Stack

The project is built with modern, production-ready technologies:

| Technology | Usage | Percentage |
|-----------|-------|-----------|
| **TypeScript** | Primary language | 76% |
| **CSS** | Styling | 17.6% |
| **JavaScript** | Scripting | 6.1% |
| **HTML** | Markup | 0.3% |

### Key Dependencies

- **React 19** - UI framework for building interactive components
- **React Flow** - Advanced workflow visualization and interaction
- **Zustand** - Lightweight state management
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Efficient form state management
- **Dagre** - Graph layout algorithms
- **Immer** - Immutable state updates
- **MSW** - Mock Service Worker for API mocking
- **Vite** - Lightning-fast build tool and dev server

## 📦 Project Structure

```
HR-WORKFLOW-DESIGNER/
├── src/                    # Source code
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HARSHAVARDHAN1904/HR-WORKFLOW-DESIGNER.git
   cd HR-WORKFLOW-DESIGNER
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the project with TypeScript type checking:

```bash
npm run build
```

### Type Checking

Run TypeScript compiler without emitting files:

```bash
npm run type-check
```

### Linting

Lint TypeScript and TSX files:

```bash
npm run lint
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production with type checking |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Check TypeScript types without emitting |
| `npm run lint` | Lint source code for quality issues |

## 🎯 Use Cases

- **HR Process Automation** - Design automated workflows for recruitment, onboarding, and employee management
- **Approval Workflows** - Create multi-step approval processes with conditional logic
- **Task Automation** - Build complex task sequences with dependencies
- **Process Visualization** - Communicate workflow logic through visual diagrams
- **Testing & Validation** - Simulate workflows to ensure correctness before deployment

## 🏗️ Architecture

The application follows a modern component-based architecture:

- **React Components** - Modular, reusable UI components
- **State Management** - Centralized state with Zustand
- **Type Safety** - Full TypeScript support for development confidence
- **Form Management** - Efficient form handling with React Hook Form
- **Graph Visualization** - Advanced node and edge rendering with React Flow

## 🔧 Configuration Files

- **vite.config.ts** - Vite build and dev server configuration
- **tsconfig.json** - TypeScript compiler options
- **tsconfig.app.json** - Application-specific TypeScript settings
- **tsconfig.node.json** - Node.js TypeScript settings for build tools
- **package.json** - Project dependencies and scripts

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**HARSHAVARDHAN1904** - [GitHub Profile](https://github.com/HARSHAVARDHAN1904)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an [issue](https://github.com/HARSHAVARDHAN1904/HR-WORKFLOW-DESIGNER/issues) on GitHub.

---

**Last Updated:** April 24, 2026  
**Repository:** [HARSHAVARDHAN1904/HR-WORKFLOW-DESIGNER](https://github.com/HARSHAVARDHAN1904/HR-WORKFLOW-DESIGNER)
