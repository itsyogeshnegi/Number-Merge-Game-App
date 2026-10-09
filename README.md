# Number Merge — Production Mobile Casual Game

A production-ready **Number Merge** (2048-style grid merge) mobile game built with **React Native**, **Expo Router**, **TypeScript**, feature-driven modular architecture, and deterministic game logic.

Designed for commercial release on Google Play and Apple App Store.

---

## 🌟 Highlights & Features

- **Commercial Quality & UX**: Responsive board layout, smooth spring animations, dynamic typography scaling (handles 2 up to 65,536+ without overflow), tactile haptic feedback, and procedural Web Audio synthesizers.
- **Configurable Grid Sizes**: Supports **4x4**, **5x5**, and **6x6** boards with seamless switching.
- **Full-Grid Drag-and-Drop Gameplay**:
  - **Every box starts filled with a random number** (2, 4, 8, 16, etc.) — no empty boards!
  - **Drag to Merge**: Touch and drag a number tile onto an adjacent tile with the same number to merge them (`2+2=4`, `4+4=8`, `8+8=16`).
  - **Upside-Down / Adjacent Neighbor Rule**: Only directly adjacent matching tiles (up, down, left, right; distance = 1) will merge — far away tiles cannot merge!
  - **Instant Refill**: When a tile merges, the vacated spot instantly refills with a fresh random number.
  - **Tap-to-Merge Accessibility**: Tap a tile to select it, then tap an adjacent matching tile to merge!
  - Game Over & Win (2048+) detection with celebration confetti overlay.
- **Power-Ups System**:
  - **Undo**: History snapshot stack (configurable max rollback depth, default 5).
  - **Hammer**: Interactive target mode to smash and remove any obstacle tile.
  - **Shuffle**: Rearranges all active tiles across occupied board cells to break deadlocks.
  - **Revive / Continue**: Rerolls tiles after Game Over via rewarded ad.
- **Monetization Architecture**:
  - **AdService**: Decoupled abstraction with frequency controller (minimum moves, games threshold, cooldown timer) so ads never disrupt active swipes.
  - **Rewarded Ads**: Opt-in rewards for Continuing after Game Over, doubling Daily Rewards, extra Undo charges, and earning +100 Coins.
  - **Interactive Ad Player Simulation**: Realistic simulated ad view with countdown timer and completion callbacks.
  - **In-App Purchases (IAP)**: Remove Ads Forever (`₹79 / $0.99`) with persistent VIP status.
- **Daily Rewards & Currency Economy**:
  - 7-day escalating streak ladder (`50, 75, 100, 150, 200, 300, 500` coins).
  - Calendar day validation (prevents repeat claims on the same day; handles streak resets on missed days).
  - Optional 2x multiplier via rewarded ad.
  - Local wallet managing coins and power-up inventory.
- **Dynamic Theming Engine**:
  - **Dark Slate** (Sleek deep indigo/navy with vibrant glowing tiles)
  - **Classic Warm** (Clean Scandinavian retro 2048 palette)
  - **Neon Cyber** (Ultra-vibrant synthwave with electric cyan & neon magenta)
- **Offline-First & Resilient Persistence**:
  - Saves current board, score, best score, highest tile, statistics, wallet, and settings with `@react-native-async-storage/async-storage`.
  - In-memory fallback and safe parsing prevents corrupted storage from crashing the application.
- **Expo Router Navigation**:
  - File-based routing in `src/app/` (`/`, `/game`, `/stats`, `/settings`, `/shop`).
  - Android hardware back button integration (opens pause menu during active games).
- **100% Tested**:
  - Comprehensive unit test suites covering movement, double-merge prevention, power-ups, daily rewards, currency logic, and corrupted save recovery.

---

## 🏗️ Architecture Overview

```
src/
├── app/                      # Expo Router navigation routes
│   ├── _layout.tsx           # Root stack navigator & providers
│   ├── index.tsx             # Home screen route
│   ├── game.tsx              # Gameplay route (supports ?size=4|5|6)
│   ├── stats.tsx             # Player statistics route
│   ├── settings.tsx          # Settings route
│   └── shop.tsx              # Item shop & bank route
│
├── features/
│   ├── game/
│   │   ├── logic/            # Pure deterministic game engine
│   │   │   ├── engine.ts     # Movement, merge, line compression
│   │   │   ├── powerups.ts   # Hammer, shuffle, revive lowest
│   │   │   └── __tests__/    # Jest unit test suites
│   │   ├── state/
│   │   │   └── useGameEngine.ts # Game lifecycle, moves, telemetry
│   │   ├── components/       # GameBoard, Tile, ScoreBoard, ControlBar, Modals
│   │   └── screens/          # GameScreen
│   ├── home/
│   │   └── screens/          # HomeScreen
│   ├── statistics/
│   │   └── screens/          # StatisticsModal
│   ├── settings/
│   │   └── screens/          # SettingsModal
│   └── shop/
│       ├── components/       # DailyRewardModal
│       └── screens/          # ShopModal
│
├── components/               # Reusable UI system
│   ├── common/               # Button, IconButton, Modal, Card, AdPlayerModal
│   └── ErrorBoundary.tsx     # Fault tolerance error boundary
│
├── services/                 # Decoupled domain services
│   ├── storage/              # AsyncStorage with in-memory fallback
│   ├── sound/                # Procedural Web Audio synthesizer
│   ├── haptics/              # Expo Haptics wrapper with web fallback
│   ├── ads/                  # Monetization & frequency controller
│   ├── currency/             # Coin wallet & power-up inventory
│   ├── dailyReward/          # 7-day streak calendar service
│   └── analytics/            # Telemetry & BI logging
│
├── theme/                    # Design tokens & theming engine
│   ├── colors.ts             # Dark Slate, Classic, Neon palettes
│   ├── dimensions.ts         # Responsive board and cell calculator
│   ├── typography.ts         # Dynamic font scaler based on digits
│   ├── spacing.ts            # Spacing & border radius tokens
│   └── ThemeContext.tsx      # ThemeProvider & useTheme hook
│
└── types/                    # Core TypeScript definitions
    ├── game.ts
    ├── monetization.ts
    └── theme.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+` or `v22+`
- npm `v10+`

### Installation

```bash
npm install
```

### Development Commands

```bash
# Start development server
npm run start

# Launch Web preview (interactive browser testing)
npm run web

# Launch Android emulator / connected device
npm run android

# Launch iOS simulator (macOS required)
npm run ios
```

### Running Tests

```bash
# Run all automated Jest test suites
npm test

# Run TypeScript typecheck
npx tsc --noEmit

# Run Expo Doctor dependency & config diagnostics
npx expo-doctor
```

---

## 🎮 Game Engine Logic & Merge Rules

### Pure Line Compression

When a line slides left, adjacent matching pairs merge once:
- `[2, 2, 2, 2]` $\rightarrow$ `[4, 4, 0, 0]` (Score gained: $+8$)
- `[2, 2, 4, 4]` $\rightarrow$ `[4, 8, 0, 0]` (Score gained: $+12$)
- `[0, 2, 0, 2]` $\rightarrow$ `[4, 0, 0, 0]` (Score gained: $+4$)
- `[2, 4, 8, 16]` $\rightarrow$ `[2, 4, 8, 16]` (Score gained: $0$, `moved = false`)

### Directional Mapping

- `LEFT`: Process each row directly.
- `RIGHT`: Reverse each row, process left, then reverse back.
- `UP`: Extract columns downwards, process left, restore columns.
- `DOWN`: Extract columns upwards, process left, restore columns.

### Move Validation & Game Over

A board can still move if:
1. At least one empty cell (`null`) exists.
2. Any horizontally adjacent pair shares the same value.
3. Any vertically adjacent pair shares the same value.

---

## 💰 Monetization Architecture

1. **Rewarded Ads**:
   - `adsService.showRewarded(description)` returns a Promise resolving `{ rewarded: boolean }`.
   - Never shown automatically — the user explicitly opts in for rewards.
2. **Interstitial Ads**:
   - Frequency controller enforces:
     - `MIN_MOVES_BEFORE_INTERSTITIAL` (default $25$ moves)
     - `MIN_GAMES_BEFORE_INTERSTITIAL` (default $2$ games)
     - `MIN_INTERVAL_SECONDS` (default $90$ seconds cooldown)
   - Never shown during active swipes or gameplay.
3. **Remove Ads Purchase**:
   - Persisted in wallet state. When `adsRemoved: true`, all interstitial triggers are automatically bypassed.

---

## 📱 Production Build with EAS

To generate native production builds for app store distribution:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build Android APK / AAB
eas build --platform android --profile production

# Build iOS IPA
eas build --platform ios --profile production
```

---

## 📄 License

MIT
#   N u m b e r - M e r g e - G a m e - A p p  
 