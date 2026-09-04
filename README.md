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
- **Continuous Card Layout** — unified, unbroken liquid-glass container for the entire app
- **3-Day Split Tracker** — Mon/Thu, Tue/Fri, Wed rotation with muscle group categorization
- **Strictly Isolated Custom Exercises** — add custom exercises per muscle group, isolated to their respective section
- **Weight Logging** — track kg with inline unit badge and automatic local persistence
- **Rep Logging with Target Caps** — track reps capped at muscle group default targets (10, 12, 15)
- **Supabase Auth** — optional sign-in to sync workout data across devices
- **Mobile-First & Responsive** — locked viewport, optimized touch targets, scales from mobile to desktop

---

## 🤖 AI Prompt (Copy & Paste to Run)

If you're using **VS Code Copilot / "Codex"**, **Google Antigravity**, **ChatGPT**, **Claude**, or **Cursor**, copy and paste the prompt below into your assistant to have it automatically set up, verify, and run this app:

````markdown
```text
Please help me set up and run this Workify project:

1. Environment & Dependencies:
   - Verify Node.js (v20+) and npm are available.
   - Run `npm install` to install dependencies.

2. Environment Config:
   - If `.env` does not exist, copy `.env.example` to `.env`.
   - Note: Supabase credentials are completely optional. The app works fully locally with automatic localStorage persistence.

3. Health Check:
   - Run unit/integration tests with `npx vitest run`.
   - Verify the production build with `npm run build`.

4. Start Dev Server:
   - Run `npm run dev` to launch the Vite development server.
   - Provide the local URL (typically http://localhost:5173) so I can open the app in my browser.
```
````

---

## Tech Stack

| Layer     | Technology                                                                      |
| --------- | ------------------------------------------------------------------------------- |
| Framework | [React 19](https://react.dev) + [TypeScript 6](https://www.typescriptlang.org)  |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com)                                       |
| Build     | [Vite 8](https://vite.dev)                                                      |
| Backend   | [Supabase](https://supabase.com) (auth + database)                              |
| Icons     | [Lucide React](https://lucide.dev)                                              |
| Testing   | [Vitest 5](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Linting   | [Oxlint](https://oxc.rs)                                                        |

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
