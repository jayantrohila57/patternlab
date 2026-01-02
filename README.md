# PatternLab

![PatternLab Screenshot](/public/ChatGPT%20Image%20Jan%202,%202026,%2001_15_21%20PM.png)

PatternLab is an interactive platform to learn, practice, and validate programming patterns through real problems, live code execution, and automated testing.

## 🚀 Features

- **Interactive Code Editor**: Monaco Editor with TypeScript support and intelligent code completion
- **Real Terminal Output**: xterm.js powered terminal showing actual code execution results
- **60+ Programming Patterns**: Comprehensive library including triangles, pyramids, grids, and advanced patterns
- **Live Code Execution**: Web Workers for safe, isolated code execution with TypeScript compilation
- **Pattern Validation**: Automatic comparison against expected outputs
- **Offline-First**: PWA capabilities for learning anywhere, anytime
- **Version Management**: Save and track multiple code attempts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Code Editor**: Monaco Editor
- **Terminal**: xterm.js
- **Styling**: TailwindCSS 4.1.17
- **Components**: shadcn/ui
- **Offline**: PWA with IndexedDB storage

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd patternlab

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Getting Started

1. **Choose a Pattern**: Browse through our extensive pattern library
2. **Write Code**: Use the Monaco Editor to write your solution
3. **Run & Test**: Execute your code and see real terminal output
4. **Validate**: Compare your output with expected results
5. **Save Progress**: Keep track of your learning journey

## 📚 Pattern Categories

### Basic Patterns

- **Triangles**: Right, inverted, mirrored, alpha, binary
- **Pyramids**: Full, hollow, centered variations
- **Grids**: Solid, hollow, checkerboard patterns

### Advanced Patterns

- **Mathematical**: Floyd's triangle, Pascal's triangle
- **Complex**: Butterfly, diamond, spiral patterns
- **Custom**: Create and share your own patterns

## 🏗️ Architecture

### Core Components

- **Code Runner**: Web Worker-based execution system
- **Pattern Engine**: Formula-based pattern generation
- **Terminal Interface**: Authentic console experience
- **State Management**: Context-based architecture

### Key Directories

```
/src
├── components/
│   ├── module/          # Core functionality (editor, terminal, runner)
│   ├── shared/layout/   # UI layout components
│   ├── ui/             # shadcn/ui components
│   └── formula/        # Pattern generation logic
├── worker/             # Web workers for code execution
└── lib/               # Utility functions
```

## 🔧 Development

### Code Quality

- ✅ TypeScript throughout with proper typing
- ✅ Modern React patterns (hooks, context, functional components)
- ✅ Comprehensive error handling
- ✅ Clean, readable code with consistent styling

### Performance Features

- Web Workers for non-blocking code execution
- Lazy loading for optimal performance
- Efficient state management
- Optimized bundle size

## 🚀 Deployment

### Build Process

```bash
npm run build
```

### Environment Variables

Create a `.env.production` file for production configuration.

### PWA Features

- Offline functionality
- App-like experience
- Background sync capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for interactive programming education
- Community-driven pattern library

## 🔗 Links

- **Live Demo**: https://patternlab.vercel.app
- **Documentation**: Check out our comprehensive guides
- **Issues**: Report bugs or request features

---

**PatternLab** - Master programming patterns through interactive learning! 🎯
