# 🎓 LSUS Connect

**Where Students Connect, Trade, and Thrive.**

LSUS Connect is a social platform exclusively for Louisiana State University Shreveport (LSUS) students. Connect with peers, buy and sell items, find roommates, post lost & found items, and stay engaged with campus life.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## ✨ Features

### 🔐 Authentication System
- **Secure Signup/Signin** - Email verification required
- **Password Reset** - Forgot password flow with email verification
- **LSUS Email Only** - Restricted to @lsus.edu email addresses
- **JWT Authentication** - Secure session management
- **Protected Routes** - Middleware-based route protection

### 🛍️ Marketplace
- Buy and sell items within the LSUS community
- Category filtering (Furniture, Electronics, Books, etc.)
- Search functionality
- Post listings with images
- Direct messaging between buyers and sellers

### 📱 Social Feed
- Create and share posts
- Like and comment on posts
- Image uploads
- User profiles
- Real-time updates

### 🏠 Roommate Finder
- Find compatible roommates
- Preference matching
- Direct contact

### 🔍 Lost & Found
- Report lost items
- Post found items
- Category filtering
- Claim requests

### 👨‍💼 Admin Dashboard
- User management
- Content moderation
- Analytics and statistics
- Report handling

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Backend:**
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Backend API
- [Supabase](https://supabase.com/) - PostgreSQL database
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing
- [jose](https://github.com/panva/jose) - JWT tokens

**Email Service:**
- [Resend](https://resend.com/) - Transactional emails

**Development Tools:**
- [ESLint](https://eslint.org/) - Code linting
- [Git](https://git-scm.com/) - Version control
- [GitHub](https://github.com/) - Code hosting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- Resend account (for emails)

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `RESEND_API_KEY` | Resend API key for sending emails | Yes |

> **Security:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## 📁 Project Structure
```
LSUS_CONNECT/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   └── auth/                 # Authentication endpoints
│   │       ├── signup/           # User registration
│   │       ├── signin/           # User login
│   │       ├── verify-email/     # Email verification
│   │       ├── forgot-password/  # Password reset request
│   │       └── reset-password/   # Password reset
│   ├── marketplace/              # Marketplace pages
│   ├── post-listing/             # Create listing page
│   ├── user-profile/             # User profile page
│   ├── lost-found/               # Lost & found page
│   ├── admin-dashboard/          # Admin panel
│   ├── signup/                   # Signup page
│   ├── signin/                   # Signin page
│   ├── verify-email/             # Email verification page
│   ├── forgot-password/          # Forgot password page
│   ├── reset-password/           # Reset password page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   └── email/                    # Email utilities
│       └── resend.ts             # Resend email service
├── middleware.ts                 # Route protection middleware
├── .env.local                    # Environment variables (not in git)
├── .gitignore                    # Git ignore file
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🔄 Development Workflow

### Branching Strategy

- `main` - Production-ready code only
- `dev` - Development branch for integration
- `feature/*` - Individual feature branches

### Workflow

1. **Start a new feature:**
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

2. **Make changes and commit:**
```bash
git add .
git commit -m "feat: description of your changes"
```

3. **Push your branch:**
```bash
git push origin feature/your-feature-name
```

4. **Create a Pull Request:**
   - Go to GitHub
   - Click "Compare & pull request"
   - Base: `dev`, Compare: `feature/your-feature-name`
   - Add description
   - Request review

5. **After approval, merge to dev**

6. **Delete feature branch:**
```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### Commit Message Convention

Use semantic commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add marketplace filtering by category
fix: resolve email verification token expiry issue
docs: update setup instructions in README
style: format authentication pages
refactor: improve database query performance
```

---

## 📜 Available Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---


## 🤝 Contributing

We welcome contributions from LSUS students and developers!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'feat: Add some AmazingFeature'`)
5. **Push to the branch** (`git push origin feature/AmazingFeature`)
6. **Open a Pull Request**

### Code Standards

- Write clean, readable code
- Follow TypeScript best practices
- Add comments for complex logic
- Test your changes locally before pushing
- Follow the existing code style
- Update documentation if needed

### Pull Request Guidelines

- Provide a clear description of changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Request review from team members

---

## 👥 Team

### Core Team

- **Showrab Bin Habib** - Lead Developer
  - GitHub: [@showrab09](https://github.com/showrab09)
  
- **Robert Lovelace** - Frontend Developer
  - GitHub: [@rphillips1977](https://github.com/rphillips1977)

- **Abid Talukder** - QA Tester
  - GitHub: [@talukderabid](https://github.com/talukderabid)

### Contributors

See the list of [contributors](https://github.com/showrab09/LSUS_CONNECT/contributors) who participated in this project.

---

## 🎨 Brand Guidelines

LSUS Connect follows the official LSUS brand guidelines:

**Colors:**
- LSUS Purple: `#461D7C`
- LSUS Gold: `#FDD023`
- Dark Purple: `#250D44`
- Light Purple: `#5a2d8c`

**Typography:**
- Headings: Proxima Nova (Bold)
- Body: Roboto (Regular)

---

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information

---

## 📝 License

This project is private and intended for LSUS students only. All rights reserved.

---

## 📞 Contact

For questions or support:

- **Email:** showrabbinhabib@gmail.com
- **GitHub Issues:** [Create an issue](https://github.com/showrab09/LSUS_CONNECT/issues)

---

## 🙏 Acknowledgments

- LSUS for brand guidelines and support
- All contributors and testers
- The LSUS student community

---

## 🚧 Roadmap

### ✅ Completed
- Authentication system (signup, signin, email verification)
- Password reset functionality
- Protected routes with middleware
- Email service integration (Resend)
- Marketplace UI
- User profile structure

### 🚀 In Progress
- Posts/Feed backend API
- Marketplace backend integration
- Image upload functionality

### 📅 Planned
- Lost & Found feature
- Roommate Finder
- Admin dashboard
- Push notifications
- Mobile app (React Native)
- Real-time chat

---

## 📊 Project Status

**Current Version:** 0.1.0 (Alpha)  
**Status:** Active Development  
**Last Updated:** February 2026

---

**Made with ❤️ by LSUS Students, for LSUS Students**

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Resend Dashboard](https://resend.com/emails)
- [Next.js Documentation](https://nextjs.org/docs)
- [LSUS Official Website](https://www.lsus.edu/)

---
