# One X Home Booking System

A premium, mobile-first booking system for One X Transmission's home inspection service.

## Features

- **Customer Booking Flow**:
  - Step-by-step wizard for capturing customer and vehicle details.
  - Interactive calendar for date and time selection.
  - Mobile-optimized design with smooth animations.
- **Admin Dashboard**:
  - Calendar view of upcoming bookings.
  - Detailed list of daily schedules.
  - Status tracking (Confirmed/Pending).
  - **Real-time Updates**: Powered by Firebase Firestore.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Firebase (Firestore)
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **Icons**: Lucide React
- **Date Handling**: date-fns, react-day-picker

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Firebase**:
    - Create a project in [Firebase Console](https://console.firebase.google.com/).
    - Create a Firestore database.
    - Copy your web app configuration.
    - Update `src/lib/firebase.ts` with your config (or see `FIREBASE_SETUP.md`).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

- `src/components/booking`: Booking form logic and UI.
- `src/components/ui`: Reusable UI components (Button, Input).
- `src/pages`: Page components (BookingPage, AdminDashboard).
- `src/lib`: Utilities (Tailwind class merger).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
