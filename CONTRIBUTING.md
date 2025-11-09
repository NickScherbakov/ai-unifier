# Contributing to AI Unifier

Thank you for your interest in contributing to AI Unifier! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-unifier.git
   cd ai-unifier
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/NickScherbakov/ai-unifier.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start development environment**:
   ```bash
   docker-compose up -d
   npm run dev
   ```

## Development Workflow

1. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. **Make your changes** following our coding standards

3. **Write/update tests** for your changes

4. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

5. **Lint your code**:
   ```bash
   npm run lint:fix
   ```

6. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add new provider adapter for XYZ"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request** on GitHub

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid `any` types when possible
- Use async/await instead of callbacks

### Code Formatting

- We use Prettier for code formatting
- Run `npm run format` before committing
- EditorConfig is configured for consistent formatting

### File Organization

```
backend/
├── src/
│   ├── api/          # API routes and controllers
│   ├── core/         # Core business logic
│   ├── providers/    # Provider implementations
│   ├── middleware/   # Express middleware
│   ├── utils/        # Utility functions
│   ├── types/        # TypeScript type definitions
│   ├── config/       # Configuration
│   └── db/           # Database models and migrations

frontend/
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API services
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
```

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Ensure all tests pass**: `npm test`
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers
6. **Address feedback** from code review
7. **Squash commits** if requested
8. **Merge** after approval

### PR Title Format

Use the same format as commit messages:
```
feat: add support for Cohere provider
fix: resolve rate limiting issue
docs: update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where necessary
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings generated
```

## Testing Requirements

### Unit Tests

- Write unit tests for all new functions and classes
- Aim for at least 80% code coverage
- Use Jest for testing
- Mock external dependencies

Example:
```typescript
describe('ProviderRegistry', () => {
  it('should register a provider', () => {
    const registry = new ProviderRegistry();
    const provider = new MockProvider();
    registry.register(provider);
    expect(registry.has(provider.id)).toBe(true);
  });
});
```

### Integration Tests

- Test API endpoints with real requests
- Use test database for integration tests
- Clean up after each test

### E2E Tests

- Use Playwright for end-to-end testing
- Test critical user workflows
- Run E2E tests in CI/CD pipeline

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include parameter descriptions and return types
- Add usage examples for complex functions

Example:
```typescript
/**
 * Creates a chat completion request
 * @param request - The chat request parameters
 * @returns Promise resolving to chat response
 * @throws {AppError} If provider is not available
 * @example
 * const response = await provider.chat({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello' }]
 * });
 */
async chat(request: ChatRequest): Promise<ChatResponse>
```

### README Updates

- Update README.md for user-facing changes
- Add examples for new features
- Update installation steps if needed

### Architecture Documentation

- Update ARCHITECTURE.md for architectural changes
- Document new components and their interactions
- Add diagrams for complex features

## Adding New Providers

To add a new AI provider:

1. Create a new file in `backend/src/providers/`
2. Implement the `AIProvider` interface
3. Register the provider in the registry
4. Add tests for the provider
5. Update documentation
6. Add provider to the examples

Example:
```typescript
export class MyNewProvider extends BaseProvider {
  readonly id = 'mynew';
  readonly name = 'My New Provider';
  readonly type = 'llm';

  async initialize(config: ProviderConfig): Promise<void> {
    // Initialize provider
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Implement chat
  }

  // Implement other required methods
}
```

## Creating Plugins

See [PLUGIN_DEVELOPMENT.md](docs/PLUGIN_DEVELOPMENT.md) for detailed plugin development guide.

## Getting Help

- Check existing [Issues](https://github.com/NickScherbakov/ai-unifier/issues)
- Join our [Discord community](https://discord.gg/ai-unifier) (coming soon)
- Ask questions in [GitHub Discussions](https://github.com/NickScherbakov/ai-unifier/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
