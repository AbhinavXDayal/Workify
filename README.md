<p align="center">
  <img src="preview/workify-logo.jpg" alt="Workify Logo" width="120" />
</p>

<h1 align="center">Workify</h1>

<p align="center">
  A clean, aesthetic workout tracker built with React, TypeScript, and Tailwind CSS.<br/>
  Liquid glass UI · warm beige palette · dynamic ambient background · mobile-first.
</p>

---

## Preview

### Mobile
<p align="center">
  <img src="preview/mobile-preview.png" alt="Workify Mobile Preview" width="320" />
</p>

### Desktop
<p align="center">
  <img src="preview/desktop-preview.png" alt="Workify Desktop Preview" width="900" />
</p>

---

## Features

- **Liquid Glass UI** — frosted glass cards, soft rounded inputs, and subtle backdrop blur effects
- **Dynamic Background** — animated floating shapes with a warm beige-to-brown gradient
- **3-Day Split Tracker** — Mon/Thu, Tue/Fri, Wed rotation with muscle group categorization
- **Custom Exercises** — add your own exercises per muscle group, persisted in localStorage
- **Weight & Rep Logging** — track kg and reps per exercise slot with auto-save
- **Supabase Auth** — optional sign-in to sync workout data across devices
- **Mobile-First** — locked viewport with no scroll, fixed bottom layout, optimized touch targets
- **Responsive** — scales gracefully from phone to desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev) + [TypeScript 6](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Build | [Vite 8](https://vite.dev) |
| Backend | [Supabase](https://supabase.com) (auth + database) |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Vitest 5](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Linting | [Oxlint](https://oxc.rs) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/AbhinavXDayal/Workify.git
cd Workify
npm install
```

### Environment Setup

Copy the example env file and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project URL and anon key.

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Test

```bash
npx vitest run
```

---

## Project Structure

```
src/
├── components/
│   ├── AestheticSelect.tsx    # Custom dropdown with exercise management
│   ├── AmbientBackground.tsx  # Animated floating shapes background
│   ├── AuthModal.tsx          # Supabase authentication modal
│   ├── DaySelector.tsx        # Mon/Thu, Tue/Fri, Wed tab switcher
│   ├── HistoryDrawer.tsx      # Workout history side drawer
│   ├── SplitHeader.tsx        # Top routine card with split overview
│   └── WorkoutTracker.tsx     # Main workout logging interface
├── constants/
│   └── workoutConfig.ts       # Split configuration and exercise groups
├── hooks/
│   ├── useAuth.ts             # Supabase auth hook
│   └── useWorkoutLogger.ts    # Workout state management hook
├── lib/
│   └── supabase.ts            # Supabase client initialization
├── types/
│   └── workout.ts             # TypeScript type definitions
├── utils/
│   └── customExercises.ts     # localStorage exercise persistence
├── App.tsx                    # Root app component
└── main.tsx                   # Entry point
```

---

## License

MIT
