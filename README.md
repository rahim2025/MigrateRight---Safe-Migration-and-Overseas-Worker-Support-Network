# MigrateRight – Safe Migration and Overseas Worker Support Network

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v16%2B-green.svg)
![React](https://img.shields.io/badge/react-v18-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v5%2B-green.svg)

A comprehensive MERN stack platform designed to support safe migration for Bangladeshi workers, providing transparency in recruitment agency operations, fee structures, and compliance tracking.

This platform addresses critical challenges faced by migrant workers: fraudulent recruitment agencies, wage theft, lack of emergency support, and financial exploitation. By providing verified information, real-time assistance, and transparent services, it creates a safer migration ecosystem.

## 🌟 Features

### For Aspiring Migrants
- 🔍 Search and compare verified recruitment agencies
- 📍 Find agencies near your location (geospatial search)
- 💰 View transparent fee structures by country and job category
- ⭐ Read reviews from workers abroad
- 📚 Access migration guidance and resources
- ✅ Track application and verification status

### For Workers Abroad
- 👤 Maintain detailed worker profile
- 📝 Share experiences through reviews
- 🆘 Access emergency support information
- 📞 Connect with family members

### For Recruitment Agencies
- 🏢 Manage agency profile and credentials
- 📊 Display services and fee structures
- 📈 Track compliance status and ratings
- 💬 Respond to reviews and inquiries

### For Platform Administrators
- ✅ Verify and approve agencies
- 📋 Monitor compliance violations
- 📊 Generate analytics and reports
- 🔐 Manage user roles and permissions

## 🏗️ Architecture

```
MigrateRight/
├── frontend/          # React application
├── backend/           # Node.js + Express API
├── docs/              # Documentation
└── .github/           # GitHub templates and workflows
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- MongoDB v5 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/MigrateRight.git
   cd MigrateRight
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1

## 📚 Documentation

- [Repository Structure](./REPOSITORY_STRUCTURE.md) - Complete directory structure
- [Coding Standards](./CODING_STANDARDS.md) - Code style and conventions
- [API Contract](./docs/API_CONTRACT.md) - REST API specifications
- [Database Schemas](./docs/SCHEMA_DOCUMENTATION.md) - MongoDB schema details
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

## 🛠️ Tech Stack

### Frontend
- **React** 18 - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Component styling
- **React Testing Library** - Testing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - File storage
- **Jest** - Testing framework

## 🔐 Environment Variables

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_CLOUDINARY_URL=your_cloudinary_url
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Backend
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/migrateright
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
EMAIL_USER=your_email@gmail.com
```

See [.env.example](./backend/.env.example) files for complete configuration.

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Test coverage
npm run test:coverage
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build/ directory
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Set environment variables
# Deploy with auto-build
```

## 📊 Database

MongoDB with Mongoose ODM

**Core Collections:**
- `users` - User profiles (all roles)
- `recruitmentagencies` - Agency information
- `reviews` - Agency reviews
- `joblisting` - Available positions

See [Schema Documentation](./docs/SCHEMA_DOCUMENTATION.md) for details.

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

### Quick Contribution Steps
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Git Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(auth): add password reset functionality
fix(agency): resolve search filter issue
docs(api): update endpoint documentation
test(user): add profile update tests
```

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Account locking after failed login attempts
- Input validation and sanitization
- CORS protection
- Rate limiting on all endpoints

Report security vulnerabilities to: security@migrateright.bd

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Development Team:**
- Frontend Team
- Backend Team
- DevOps Team
- QA Team

**Project Advisor:** [Name]  
**Course:** Software Engineering  
**Institution:** [University Name]

## 🙏 Acknowledgments

- Bureau of Manpower, Employment and Training (BMET), Bangladesh
- Migrant worker advocacy organizations
- Open source community

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/MigrateRight/issues)
- **Email:** support@migrateright.bd

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] User authentication and authorization
- [x] Agency listing and search
- [x] Geospatial search functionality
- [ ] Review system
- [ ] Profile management

### Phase 2 (Planned)
- [ ] Job listing marketplace
- [ ] Real-time chat support
- [ ] SMS notifications
- [ ] Multi-language support (Bengali/English)
- [ ] Mobile application

### Phase 3 (Future)
- [ ] AI-powered agency recommendations
- [ ] Contract verification system
- [ ] Payment tracking
- [ ] Worker rights documentation

## 📈 Project Status

🚧 **Active Development** - Version 1.0 (Beta)

Last Updated: December 21, 2025

---

**Built with ❤️ for safer migration**
