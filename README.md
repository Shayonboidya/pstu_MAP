# PSTU Interactive Campus Map

A modern, responsive, and fully-featured interactive campus mapping application for **Patuakhali Science and Technology University (PSTU)**.

![PSTU Campus Map](https://img.shields.io/badge/PSTU-Campus-10b981?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge)

## Features

### 🗺️ Interactive Map
- Real-time map with OpenStreetMap tiles
- Pan, zoom, and scroll navigation
- Category-based location markers with custom icons
- Clickable location popups with key information
- Search functionality with debounced results
- Category filtering for quick navigation
- User location detection (with permission)
- Route planning between campus locations
- Keyboard-accessible controls

### 🔐 Authentication & Authorization
- User sign-up and sign-in
- Role-based access control (Visitor, User, Admin)
- Protected routes for authenticated users
- Admin-only management features
- Session persistence

### 📋 Location Management
- Add new campus locations
- Edit existing locations
- Delete locations with confirmation
- Location submissions with admin approval workflow
- Category-based organization
- Status tracking (Pending, Approved, Rejected)

### 🎨 Modern UI/UX
- Clean, professional design inspired by modern mapping products
- Fully responsive layout for desktop, tablet, and mobile
- Skeleton loaders and empty states
- Toast notifications for user feedback
- Consistent design system with Tailwind CSS

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Leaflet + React Leaflet** - Interactive maps
- **React Router** - Client-side routing
- **Zustand** - State management
- **Zod + React Hook Form** - Form validation
- **Lucide React** - Icon library
- **Toastify** - Notification system

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Database-level permissions

### Testing
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pstu-campus-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database**
   
   Run the SQL migration:
   ```bash
   psql -h <your-db-host> -U postgres -d postgres -f migrations/001_initial_schema.sql
   ```
   
   Or use the Supabase SQL Editor to run the migration file.

5. **Create the first admin user**
   
   Sign up through the app, then manually update the database:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
pstu-campus-map/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Atomic UI components
│   │   ├── AppHeader.tsx   # Main navigation
│   │   ├── MapView.tsx     # Interactive map component
│   │   ├── LocationMarker.tsx
│   │   ├── LocationDetails.tsx
│   │   ├── LocationForm.tsx
│   │   └── RoutePlanner.tsx
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── LocationPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── ManageLocationsPage.tsx
│   │   ├── SubmissionsPage.tsx
│   │   ├── ReviewSubmissionsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useDebounce.ts
│   ├── lib/                # Utilities
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── services/           # API services
│   │   ├── locationService.ts
│   │   ├── categoryService.ts
│   │   ├── authService.ts
│   │   └── routingService.ts
│   ├── store/              # Zustand stores
│   │   └── mapStore.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── layouts/            # Page layouts
│   │   └── MainLayout.tsx
│   ├── test/               # Test setup
│   │   └── setup.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── migrations/             # SQL migrations
│   └── 001_initial_schema.sql
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run type-check` | Run TypeScript type checking |

## Database Schema

### Tables

**profiles**
- `id` (UUID, primary key, references auth.users)
- `display_name` (VARCHAR)
- `role` (VARCHAR: visitor, user, admin)
- `created_at` (TIMESTAMP)

**categories**
- `id` (UUID, primary key)
- `name` (VARCHAR, unique)
- `icon` (VARCHAR)
- `color` (VARCHAR)
- `created_at` (TIMESTAMP)

**locations**
- `id` (UUID, primary key)
- `name` (VARCHAR)
- `description` (TEXT)
- `category_id` (UUID, foreign key)
- `latitude` (DOUBLE PRECISION)
- `longitude` (DOUBLE PRECISION)
- `address` (TEXT)
- `image_url` (TEXT)
- `opening_hours` (VARCHAR)
- `contact_information` (VARCHAR)
- `status` (ENUM: approved, pending, rejected)
- `created_by` (UUID, foreign key)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**location_submissions**
- `id` (UUID, primary key)
- All location fields
- `submitted_by` (UUID, foreign key)
- `review_status` (VARCHAR)
- `reviewed_by` (UUID, foreign key)
- `reviewed_at` (TIMESTAMP)

## RLS Policies

- **Public**: Can view approved locations and categories
- **Authenticated users**: Can view own locations, submit new locations
- **Admins**: Full access to manage all data

## Configuration

### Adding New Categories

Edit the migration file to add default categories, or insert directly:

```sql
INSERT INTO categories (name, icon, color) VALUES 
  ('New Category', '🏷️', '#ff0000');
```

### Customizing Map Styles

Modify `src/components/MapView.tsx` to change map appearance and behavior.

## Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard

### Netlify

1. Connect repository in Netlify dashboard
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## Development

### Adding New Components

1. Create component in `src/components/`
2. Follow naming convention: `ComponentName.tsx`
3. Use TypeScript interfaces from `src/types/`
4. Add to main exports if needed

### Testing

```bash
npm run test
npm run test:watch
```

## Troubleshooting

### Supabase Connection Issues
- Verify `.env` variables are set correctly
- Check Supabase project URL and API keys
- Ensure database migrations have been applied

### Map Not Loading
- Check browser console for errors
- Verify internet connection
- Check OpenStreetMap tile availability

### Database Errors
- Run migrations: `psql -f migrations/001_initial_schema.sql`
- Check RLS policies: `SELECT * FROM pg_policies;`

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run lint && npm run test`
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- PSTU administration for project support
- OpenStreetMap contributors for map data
- All open-source libraries used in this project

## Contact

For issues and feature requests, please create an issue in the repository.

---

Built with ❤️ for the PSTU community