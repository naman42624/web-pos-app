# POS System - Fusion Starter

A modern, full-stack Point of Sale (POS) system built with React, Express, and MongoDB.

## Features

- **Role-Based Access Control (RBAC)**: Admin, Manager, and Delivery Boy roles
- **Inventory Management**: Manage products, items, and stock levels
- **Sales Management**: Create sales, track payments, manage discounts
- **Delivery Management**: Track deliveries, assign delivery boys, update delivery status
- **Customer Management**: Manage customer information and credit records
- **Operations Dashboard**: Kanban-style dashboard for deliveries and pickups
- **User Management**: Create users, assign roles, manage permissions
- **Authentication**: Secure JWT-based authentication

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express, Node.js, MongoDB
- **Deployment**: Heroku (traditional dyno)
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens

## Local Development

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB running locally or MongoDB Atlas connection string
- Modern browser

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd pos-system
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with:
   - `MONGODB_URL`: Your MongoDB connection string
   - `JWT_SECRET`: A random secret for JWT signing

4. **Start development server**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:8080`

5. **Default Login Credentials**
   - Email: `gauravbhatia3630@gmail.com`
   - Password: (Set on first login or via admin panel)

## Deployment

### Deploy to Heroku

The project is configured for Heroku deployment. See [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md) for detailed instructions.

**Quick Start:**

1. Install Heroku CLI: `npm install -g heroku`
2. Create app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set MONGODB_URL="..." JWT_SECRET="..."`
4. Deploy: `git push heroku main`
5. View logs: `heroku logs --tail`

See [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md) for complete step-by-step guidance.

## Project Structure

```
.
├── client/                 # React frontend
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (auth, POS)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and API client
│   └── global.css         # Global styles
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── db/                # Database models
│   ├── middleware/        # Custom middleware (auth, permissions)
│   └── scripts/           # Setup scripts
├── netlify/functions/     # Netlify serverless functions
├── netlify.toml          # Netlify configuration
└── vite.config.ts        # Vite build configuration
```

## Key Modules

### Authentication

- JWT-based authentication
- Role-based access control
- Login page with role selection (Admin/Delivery Boy)

### Pages

- **Dashboard**: Operations dashboard with Kanban board for deliveries/pickups
- **Sales**: Sales management (quick sale, add sale, view all sales)
- **Deliveries**: Delivery tracking and management
- **Inventory**: Manage items and products
- **Customers**: Customer management and credit records
- **Users**: User management (admin only)
- **Roles**: Permission management (admin only)

### Context & State

- `POSProvider`: Manages POS data (sales, items, customers, etc.)
- `AuthContext`: Manages user authentication state

## API Routes

All API routes are protected with authentication middleware.

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/delivery-boy/verify` - Verify delivery boy PIN

### Data Management

- `/data/items` - Inventory items
- `/data/products` - Products
- `/data/sales` - Sales records
- `/data/customers` - Customer data
- `/data/delivery-boys` - Delivery personnel
- `/data/credit-records` - Credit transactions

### User & Role Management

- `/users` - User management
- `/roles` - Role and permission management

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (frontend + backend)

# Building
pnpm build            # Build both frontend and backend
pnpm build:client     # Build React app only
pnpm build:server     # Build backend only

# Code quality
pnpm format.fix       # Format code with Prettier
pnpm typecheck        # TypeScript type checking
pnpm test             # Run tests

# Production
pnpm start            # Run production build locally
```

## Environment Variables

### Local Development (.env.local)

```
MONGODB_URL=mongodb://localhost:27017/pos-system
JWT_SECRET=your-secret-key
```

### Production (Netlify Dashboard)

```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-production-secret
NODE_ENV=production
```

## Performance Tips

- Images must be < 3MB (enforced)
- MongoDB Atlas recommended for production
- Enable connection pooling in MongoDB
- Use browser DevTools to monitor API performance

## Troubleshooting

### MongoDB Connection Issues

- Verify connection string is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

### API Errors

- Check browser console for detailed error messages
- Review Netlify Function logs in Netlify dashboard
- Verify environment variables are set correctly

### Build Failures

- Run `pnpm install` to ensure dependencies
- Check Node.js version (18+)
- Try `pnpm build` locally to see detailed errors

## Support & Documentation

- [Netlify Deployment Guide](./NETLIFY_DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## License

Private - For authorized use only.

## Contributing

Guidelines for development and code contributions:

1. Follow existing code patterns
2. Use TypeScript for type safety
3. Format code with `pnpm format.fix`
4. Test changes locally before pushing
5. Write clear commit messages
