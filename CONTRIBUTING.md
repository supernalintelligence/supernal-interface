# Contributing Guidelines

## Development Workflow

### Branch Management
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New features (`feature/user-authentication`)
- **fix/**: Bug fixes (`fix/login-validation`)
- **docs/**: Documentation updates (`docs/api-reference`)

### Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication system
fix: resolve login validation issue
docs: update API documentation
style: format code with prettier
refactor: simplify error handling logic
test: add unit tests for auth module
chore: update dependencies
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make your changes with clear, atomic commits
3. Ensure all tests pass and code is formatted
4. Create PR against `develop` branch
5. Request review from team members
6. Merge after approval and CI passes

### Code Quality
- All code must pass linting and formatting checks
- Write tests for new functionality
- Update documentation for API changes
- Follow existing code patterns and conventions

### Pre-commit Hooks
This repository uses pre-commit hooks to ensure code quality:
- Linting and formatting
- Type checking
- Test execution
- Security scanning

To set up pre-commit hooks:
```bash
npm install  # or pip install pre-commit for Python
npm run prepare  # or pre-commit install for Python
```
