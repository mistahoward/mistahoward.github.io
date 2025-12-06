# Linting & Formatting Setup

This monorepo is configured with ESLint and Prettier for both frontend (Preact) and backend (TypeScript/Cloudflare Workers).

## Configuration

### Prettier
- **Tabs**: 4 spaces
- **Quotes**: Double quotes (enforced by ESLint)
- **Semicolons**: Required
- **Line length**: 80 characters
- **Trailing commas**: ES5 style

### ESLint

#### Frontend (Preact)
- Uses `eslint-plugin-preact` for Preact-specific rules
- Compatible with React rules but optimized for Preact
- TypeScript support with `@typescript-eslint`
- Airbnb style guide with customizations

#### Backend (Cloudflare Workers)
- Node.js environment
- TypeScript support
- Airbnb base style guide
- Optimized for Cloudflare Workers

## Available Commands

### Root Level (Monorepo)
```bash
# Lint all projects
npm run lint

# Fix linting issues
npm run lint:fix

# Format all code
npm run format

# Check formatting
npm run format:check
```

### Frontend Only
```bash
cd frontend

# Lint
npm run lint

# Fix linting
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Backend Only
```bash
cd backend

# Lint
npm run lint

# Fix linting
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Key Rules

### Preact vs React
- Uses `preact/` prefixed rules instead of `react/` rules
- Disables React-specific rules that don't apply to Preact
- Maintains compatibility with React ecosystem

### TypeScript
- Strict type checking enabled
- No explicit `any` types allowed (configurable)
- Proper import/export handling

### Code Style
- Tabs for indentation
- Double quotes for strings
- Semicolons required
- 80 character line limit
- Arrow functions for components

## IDE Integration

### VS Code
Install these extensions for the best experience:
- ESLint
- Prettier - Code formatter

### Recommended Settings
```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"eslint.validate": [
		"javascript",
		"javascriptreact",
		"typescript",
		"typescriptreact"
	]
}
```

## Preact-Specific Notes

The ESLint configuration uses `eslint-plugin-preact` which provides:
- Preact-specific JSX rules
- Proper component detection
- Hook rules compatibility
- Import/export optimization
