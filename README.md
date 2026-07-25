# TripPlanner

A full stack web application for planning multi-destination trips, tracking planned vs. actual travel experiences, and preserving them as memories.

Built for CMS22204 Full Stack Development (Ravensbourne).

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT, bcrypt

## Features

- User registration/login with role-based access (user/admin)
- Create trips with multiple destinations, each with dated activities
- Track planned vs. actual budget per activity
- Mark destinations/activities as visited (only after their date has passed)
- 1–5 star ratings on visited activities
- Image upload for trips, destinations, and activities
- Auto-generated trip summary with downloadable PDF
- Personal dashboard: spend by category, planned vs actual budget, trips per year
- Admin panel: manage users, manage activity categories, platform stats
- Currency selection per trip

## Setup

### Prerequisites
- Node.js
- PostgreSQL

### Backend

cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm start

Create a `.env` file in `backend/` with:

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/trip_planner"
JWT_SECRET="your_secret_here"


### Frontend

cd frontend
npm install
npm start


## API Overview

| Route | Description |
|---|---|
| `/auth` | Register, login |
| `/trips` | Trip CRUD, dashboard stats |
| `/destinations` | Destination CRUD |
| `/activities` | Activity CRUD |
| `/categories` | Category management |
| `/admin` | User management, platform stats |
| `/images` | Image upload/delete |
