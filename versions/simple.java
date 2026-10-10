# Project: PSTU Interactive Campus Map

Act as a senior full-stack developer, UI/UX designer, database architect, and software tester. Build a complete, modern, responsive, production-minded interactive campus mapping web application for **Patuakhali Science and Technology University (PSTU), Dumki, Patuakhali, Bangladesh**.

The application must have a beautiful interface, genuinely working interactions, a properly connected backend, persistent database storage, authentication, and useful campus mapping features.

Do not build a static UI mockup. Every visible button, form, filter, and major feature must work correctly.

## 1. Technology Stack

Use the following technologies:

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Mapping: Leaflet + React Leaflet
- Map tiles: OpenStreetMap, with proper attribution
- Backend and database: Supabase + PostgreSQL
- Authentication: Supabase Auth
- Form validation: Zod with React Hook Form
- Icons: Lucide React
- Notifications: Toast notifications for success and error states
- Routing between pages: React Router
- Testing: Vitest and React Testing Library

Use stable, compatible package versions and maintain strict TypeScript typing. Avoid unnecessary dependencies.

## 2. Design Requirements

Create a polished, professional campus mapping application inspired by modern mapping products and university websites.

Design direction:
- Clean, modern, premium-looking interface
- Light theme with white surfaces, subtle gray backgrounds, dark text, and tasteful green or blue accents
- Clear typography, consistent spacing, rounded cards, subtle shadows, and polished hover states
- Responsive layouts for desktop, tablet, and mobile
- Smooth but restrained animations
- Accessible color contrast, keyboard navigation, visible focus states, and descriptive labels
- Use Lucide icons instead of random emoji icons
- Include skeleton loaders, empty states, loading indicators, error states, and confirmation dialogs where appropriate

Desktop layout:
- A compact top navigation bar with the university name, logo placeholder, search field, and user menu
- An interactive map occupying most of the available workspace
- A collapsible sidebar containing location categories and searchable place results
- A details panel or popup when a location is selected
- Floating map controls for zooming, recentering, and other supported map actions

Mobile layout:
- Full-width map with properly sized controls
- Search and category filters that work comfortably on small screens
- A bottom sheet or compact panel for location details
- No horizontal overflow or controls covering essential map interactions

Create a consistent design system with reusable components. Do not use a generic dashboard template that feels unrelated to a university campus map.

## 3. Interactive Map

Implement a real, interactive Leaflet map using OpenStreetMap tiles.

Required functionality:
- Pan, zoom, and scroll-wheel zoom
- Display campus locations using custom, category-based markers
- Show informative popups when markers are clicked
- Open a detailed location panel when a place is selected
- Search locations by name and description
- Filter locations by category
- Show the selected location's coordinates
- Recenter the map on the university or selected location
- Display the user's current location only after requesting browser permission
- Handle denied location permission gracefully
- Provide a useful map legend
- Support keyboard-accessible controls where practical
- Handle tile loading failures and network errors gracefully

Use verified coordinates for real locations whenever possible. Never invent the exact coordinates of university buildings and present them as verified.

If accurate campus data is unavailable, clearly label initial locations as sample data and provide an easy way to replace them.

Do not copy Google Maps tiles or proprietary map data. Use OpenStreetMap-compatible services and follow their attribution and usage policies.

## 4. Campus Location Categories

Support these configurable categories:

- Academic Buildings
- Administrative Buildings
- Departments and Laboratories
- Student Halls and Hostels
- Library
- Cafeteria and Food
- Mosque and Prayer Facilities
- Sports and Recreation
- Main Gate and Entrances
- Medical Facilities
- Transport and Parking
- Other Places

Each location should contain:
- Unique ID
- Name
- Description
- Category
- Latitude and longitude
- Address or campus area, if known
- Optional image URL
- Opening hours, if verified and available
- Contact information, if available
- Created by and creation timestamp
- Updated timestamp

Make optional fields genuinely optional. Never invent contact details, opening hours, or descriptions of real facilities.

## 5. Search and Discovery

Implement functional search and filtering.

Requirements:
- Search by place name and description
- Case-insensitive matching
- Debounced search if appropriate
- Filter by one or more categories
- Clear all filters
- Show the number of matching locations
- Display a helpful empty state when no results match
- Clicking a result should select its marker and move the map to that location
- Keep the search results and visible markers synchronized
- Provide a way to return to the full campus view

Search and filters must operate on actual database-backed location records, not hardcoded UI examples.

## 6. Route and Directions

Implement working route planning between two selected campus locations.

Requirements:
- Allow users to choose a starting point and destination
- Support selecting places from search results or map markers
- Display the route as a polyline on the map
- Show the route distance and estimated travel time when the routing service provides them
- Allow users to switch or reverse start and destination
- Handle missing routes and API failures with clear messages
- Provide a clear-route action

Use a compatible routing provider such as OSRM or another suitable service. Check its current usage limits and public-service policies before integrating it.

Do not assume that straight-line distance is a navigable route. Clearly distinguish walking or driving estimates from actual verified routes. Do not fabricate travel times.

Keep the routing integration in a separate service module so that the provider can be replaced later.

## 7. Add and Manage Locations

Provide a complete location management workflow.

Users with authorized permissions should be able to:
- Add a location by clicking on the map
- Enter the place name, category, description, and coordinates
- Adjust the marker position
- Preview the location before saving
- Edit an existing location
- Delete a location after confirmation
- Cancel an unsaved form
- View validation errors beside the relevant fields

After saving, changes must persist in Supabase and appear in the map and search results without requiring a page reload.

Visitors must not be able to modify official campus records directly.

If user-submitted places are supported, store them as pending submissions until an administrator approves them.

## 8. Authentication and Roles

Implement Supabase authentication.

Required:
- Sign up, sign in, sign out, and session persistence
- Password reset flow
- Proper loading and error states
- Protected management pages
- Role-based authorization
- Public visitor access to approved campus locations

Roles:
- Visitor: View and search approved locations and use supported map features
- Registered user: Optionally submit new locations for review
- Admin: Manage locations, categories, and submissions

Do not allow users to become administrators by selecting a role during signup.

Create and manage admin privileges through a secure, trusted process. Never expose a Supabase service-role key or other privileged secret in frontend code.

## 9. Backend and Database

Create actual Supabase database tables and SQL migrations.

Suggested schema:

**profiles**
- id: UUID linked to auth.users
- display_name
- role
- created_at

**categories**
- id
- name
- icon
- color
- created_at

**locations**
- id
- name
- description
- category_id
- latitude
- longitude
- address
- image_url
- opening_hours
- contact_information
- status
- created_by
- created_at
- updated_at

**location_submissions**
- id
- proposed location fields
- submitted_by
- review_status
- reviewed_by
- reviewed_at
- created_at

Use appropriate foreign keys, indexes, constraints, timestamps, and validation.

Enforce latitude between -90 and 90 and longitude between -180 and 180. Add sensible constraints for required fields and unique identifiers.

Use Supabase Row Level Security (RLS) policies.

Security requirements:
- Public users can read approved locations and publicly visible categories
- Only authorized admins can modify official campus locations and categories
- Authenticated users can create and manage only their own submissions
- Only authorized admins can approve or reject submissions
- Users cannot elevate their own privileges
- Prevent unauthorized updates and deletions
- Do not rely on frontend checks alone for authorization
- Never expose service-role credentials in the browser

Provide SQL migration files and clear instructions for applying them. Make sure the policies support the actual application operations.

## 10. Data Fetching and State Management

Implement a clean separation between UI components and data access.

Create reusable modules for:
- Supabase client
- Location service
- Category service
- Authentication and authorization
- Routing service
- Form validation
- Shared TypeScript types

Implement:
- Proper loading states
- Error handling
- Safe asynchronous requests
- Optimistic updates only when appropriate
- Cache invalidation or refetching after mutations
- Duplicate-submission prevention
- Consistent user feedback

Do not duplicate business logic across multiple components. Do not store important records only in React state or browser localStorage.

## 11. Image Handling

If location images are supported:
- Use Supabase Storage or another properly configured storage service
- Validate permitted file types and file size
- Apply appropriate storage access policies
- Show an image preview before upload
- Handle upload errors
- Prevent unauthorized users from replacing official images

If image upload is not implemented, omit the upload controls rather than showing a fake upload button.

## 12. Pages and Components

Implement these pages or equivalent views:

1. Interactive Campus Map
2. Location Details
3. Sign In and Sign Up
4. User Submissions
5. Admin Dashboard
6. Manage Locations
7. Review Submissions
8. Not Found page

Use reusable components such as:
- AppHeader
- MapView
- MapControls
- LocationMarker
- LocationPopup
- LocationSidebar
- SearchBar
- CategoryFilter
- LocationForm
- RoutePlanner
- AuthGuard
- AdminGuard
- LoadingState
- ErrorState
- ConfirmDialog

Keep the interface simple for visitors. Management features should not clutter the main map.

## 13. Testing and Quality

Write tests for important behavior, including:
- Search and category filtering
- Form validation
- Coordinate validation
- Authentication-dependent access
- Unauthorized mutation prevention
- Location creation and editing
- Error and empty states
- Route-service error handling

Fix TypeScript errors, lint errors, broken imports, and build errors.

Do not claim that a feature works unless it is implemented. Do not replace failed backend calls with fake success messages.

## 14. Deliverables

Generate a complete project with:

1. Full source code
2. Organized folder structure
3. Supabase SQL migrations
4. RLS policies
5. `.env.example` with required variable names but no real secrets
6. `.gitignore`
7. Package configuration
8. Setup instructions in README.md
9. Instructions for creating and configuring a Supabase project
10. Instructions for applying migrations and creating the first admin securely
11. Instructions for running locally and deploying
12. Tests and production build verification
13. A list of any remaining limitations

Use environment variables such as:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Use the appropriate current Supabase publishable-key configuration if supported by the installed SDK. Never put a service-role key in a VITE_ variable.

## 15. Development Workflow

Work in the following order:

Phase 1: Inspect the existing repository and create the application structure.

Phase 2: Build the complete responsive interface and real OpenStreetMap integration.

Phase 3: Implement search, category filtering, location details, and marker interactions.

Phase 4: Configure Supabase, database migrations, RLS policies, and authentication.

Phase 5: Implement persistent location management and user submissions.

Phase 6: Implement route planning with a real routing provider.

Phase 7: Add tests, accessibility improvements, error handling, and deployment documentation.

After each phase:
- Check the code for errors
- Verify that the implemented functionality works
- Summarize the files created or changed
- List required setup actions
- Identify any unfinished features honestly

If a required API key, external service, or credential is unavailable, implement the integration cleanly and explain how to configure it. Do not pretend that external services have been tested.

Start by inspecting the available development environment. Then build the project in the workspace, creating actual files rather than returning only code snippets. Prioritize a working, polished end-to-end application over unnecessary complexity.

The final result must be a genuinely interactive, database-backed PSTU campus map, not merely a beautiful mockup.