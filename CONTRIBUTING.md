# Contributing to MigrateRight

Thank you for your interest in contributing to MigrateRight! This document provides guidelines for contributing to the project.

## 🎯 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MigrateRight.git
   cd MigrateRight
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/MigrateRight.git
   ```

4. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd ../backend && npm install
   ```

5. **Setup environment variables**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env
   
   # Backend
   cp backend/.env.example backend/.env
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

---

## 🔄 Workflow

### 1. Sync with Upstream
Before starting work, ensure your fork is up to date:
```bash
git checkout develop
git fetch upstream
git merge upstream/develop
git push origin develop
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/user-authentication` - New features
- `bugfix/login-error` - Bug fixes
- `hotfix/security-patch` - Urgent fixes
- `docs/api-documentation` - Documentation updates

### 3. Make Changes
- Write clean, readable code
- Follow [coding standards](./CODING_STANDARDS.md)
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Linting
npm run lint
```

### 5. Commit Your Changes
Follow [conventional commits](./CODING_STANDARDS.md#git-commit-conventions):
```bash
git add .
git commit -m "feat(auth): add password reset functionality"
```

### 6. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request
1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select `develop` as base branch
4. Fill out the PR template
5. Request review from maintainers

---

## 📋 Pull Request Guidelines

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] All tests pass
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
```

### PR Best Practices
- Keep PRs small and focused (< 400 lines of code)
- Write descriptive PR titles and descriptions
- Link related issues: `Closes #123`
- Respond to review comments promptly
- Ensure CI/CD checks pass

---

## 🐛 Reporting Bugs

### Before Submitting
- Check if the bug has already been reported
- Ensure you're using the latest version
- Reproduce the bug in a clean environment

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js version: [e.g., 18.17.0]

## Screenshots
If applicable
```

---

## 💡 Requesting Features

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What user problem does this address?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Mockups, examples, references
```

---

## 🎨 Code Style

### JavaScript/React
- Use ES6+ features
- Functional components with hooks (React)
- No unused variables or imports
- Meaningful variable names

### Example - Good Code
```javascript
// ✅ GOOD
const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};
```

### Example - Bad Code
```javascript
// ❌ BAD
const getUserData = async (id) => {
  const res = await api.get('/users/' + id);
  return res.data;
};
```

---

## 🧪 Testing Guidelines

### Frontend Tests
- Test user interactions
- Test component rendering
- Test edge cases

```javascript
describe('LoginForm', () => {
  it('should display validation error for invalid email', () => {
    // Test implementation
  });
  
  it('should call onSubmit with form data', () => {
    // Test implementation
  });
});
```

### Backend Tests
- Test all endpoints
- Test authentication/authorization
- Test error handling

```javascript
describe('POST /api/v1/auth/login', () => {
  it('should return token for valid credentials', async () => {
    // Test implementation
  });
  
  it('should return 401 for invalid credentials', async () => {
    // Test implementation
  });
});
```

---

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Explain complex logic
- Document API endpoints

### README Updates
- Update setup instructions if dependencies change
- Add new features to feature list
- Update environment variables section

---

## 🚫 What NOT to Do

- ❌ Commit directly to `main` or `develop`
- ❌ Include sensitive data (API keys, passwords)
- ❌ Submit PRs with failing tests
- ❌ Push `node_modules` or build files
- ❌ Use `console.log` in production code
- ❌ Ignore linting errors
- ❌ Make unrelated changes in one PR

---

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## 📞 Need Help?

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an Issue
- **Features**: Create a Feature Request
- **Chat**: Join our Discord/Slack (if applicable)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to MigrateRight! 🙏**

Every contribution, no matter how small, helps make safe migration accessible to everyone.
