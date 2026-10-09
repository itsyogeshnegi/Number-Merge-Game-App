<div align="center">

# 🎮 NUMBER MERGE

### *A Production-Ready Mobile Casual Puzzle Game*

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Jest Tested](https://img.shields.io/badge/Tests-22%2F22_Passing-10B981?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Platforms](https://img.shields.io/badge/Platform-Android_%7C_iOS_%7C_Web-38BDF8?style=for-the-badge)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<br/>

**Number Merge** is a high-performance, polished casual mobile puzzle game built with **React Native**, **Expo Router**, and **TypeScript**. Designed from the ground up for commercial store release on both Google Play and the Apple App Store.

[Features](#-key-features) • [Gameplay Mechanics](#-how-to-play) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Testing](#-automated-tests) • [Build & Release](#-building-for-production)

</div>

---

## 📸 Overview

Unlike traditional 2048 clones, **Number Merge** fills the **entire board** with random numbers from the start. Players drag number tiles onto adjacent matching numbers to merge and double their values. Every merge triggers a smooth pop animation, procedural synthesizer melodies, tactile haptics, and drops in fresh numbers from above!

```
┌──────┬──────┬──────┬──────┐
│  2   │  8   │  4   │  2   │  ◄── Every cell pre-filled with numbers!
├──────┼──────┼──────┼──────┤
│  2 ──┼─►[4] │  16  │  8   │  ◄── Drag adjacent same numbers to merge!
├──────┼──────┼──────┼──────┤      (2 + 2 = 4,  4 + 4 = 8,  8 + 8 = 16...)
│  4   │  16  │  32  │  4   │
├──────┼──────┼──────┼──────┤
│  8   │  32  │  64  │  2   │  ◄── Empty spot immediately refills!
└──────┴──────┴──────┴──────┘
```

---

## ✨ Key Features

### 🕹️ Innovative Drag-to-Merge Gameplay
- **Full-Grid Initialization**: Every cell across the grid is pre-populated with random numbers (2, 4, 8, 16...). No waiting on an empty board!
- **Tactile Drag-and-Drop**: Touch/mouse drag a number tile directly onto an adjacent matching tile to merge.
- **Upside-Down / Adjacent Neighbor Rule**: Only immediate neighbors (Up, Down, Left, Right; distance = 1) can merge. Far-away tiles cannot merge!
- **Instant Drop Refill**: Vacated cells immediately refill with a fresh random number dropping in from above.
- **Tap-to-Merge Alternative**: Tap any tile to select it, then tap an adjacent match to merge.

### 📐 Dynamic Board Sizes
- Seamlessly switch between **4 × 4**, **5 × 5**, and **6 × 6** grid layouts.
- Dynamic responsive layout engine (`calculateBoardDimensions`) auto-sizes tiles to fit phone screens, tablets, and web browsers with zero overflow.
- Typography auto-scaler (`getTileFontSize`) scales numbers dynamically so high values (1024, 2048, 65536+) never clip or wrap.

### ⚡ Power-Ups System
- ↩️ **Undo**: State snapshot rollback stack (rewind up to 5 previous moves).
- 🔨 **Hammer**: Interactive target mode to smash and eliminate obstacle tiles.
- 🔀 **Shuffle**: Rearranges all active board tiles to break deadlocks.
- 🔄 **Revive / Continue**: Rerolls tiles after Game Over via rewarded ad to keep streaks alive!

### 💰 Monetization & In-Game Economy
- **AdsService Architecture**: Decoupled monetization with frequency controller (minimum move counts, session thresholds, and cooldowns) so ads never disrupt active gameplay.
- **Rewarded Video Ads**: Voluntary rewards for Revives, doubling Daily Bonuses, or earning free coins.
- **Interactive Ad Player Simulation**: Built-in interactive sponsored video modal with countdown timer and completion callbacks.
- **Remove Ads (VIP)**: Permanent in-app purchase flow that bypasses all interstitials.
- **Coin Wallet**: Local transactional currency system powering power-up purchases.

### 🎁 7-Day Daily Streak Rewards
- Escalating reward ladder: **50 → 75 → 100 → 150 → 200 → 300 → 500** coins.
- Calendar-day validation prevents duplicate daily claims and tracks continuous login streaks.
- 2× Multiplier option powered by rewarded ads.

### 🎨 3 Premium Themes
- 🌌 **Dark Slate**: Cyberpunk deep indigo (`#0B0F19`) with glowing neon tiles.
- ☕ **Classic Warm**: Scandinavian minimalist beige, warm wood, and soft cream tones.
- ⚡ **Neon Cyber**: Pitch black (`#030712`) with electric cyan, magenta, and high-voltage borders.

### 🔊 Procedural Audio & Haptic Feedback
- **Melodic Synthesizer**: Web Audio synth dynamically shifts pitch upward with higher tile values (from 220Hz up to 2093Hz).
- **Ascending Combo Arpeggios**: Uplifting chords play on consecutive merges.
- **Expo Haptics**: Light, medium, and heavy vibration patterns tailored for normal merges, milestone tiles, and achievements.

### 📱 Safe-Area Responsive UX
- Employs `useSafeAreaInsets` for camera notches, dynamic islands, and Android system navigation bars (`|||  O  <`).
- Equal-height bottom navigation dock (`height: 52px`) ensuring balanced touch targets across all screen sizes.

---

## 🏗️ Architecture

The codebase follows a modular, feature-oriented structure with complete decoupling of game logic from presentation:

```
src/
├── app/                        # Expo Router file-based screens
│   ├── _layout.tsx             # Root stack navigator & global providers
│   ├── index.tsx               # Home screen route (/)
│   ├── game.tsx                # Gameplay screen route (/game?size=4|5|6)
│   ├── stats.tsx               # Player statistics modal (/stats)
│   ├── settings.tsx            # Settings & theme modal (/settings)
│   └── shop.tsx                # Item shop & bank modal (/shop)
│
├── features/
│   ├── game/
│   │   ├── logic/              # Pure deterministic game algorithms
│   │   │   ├── engine.ts       # Full-board generation, drag validation & merge
│   │   │   ├── powerups.ts     # Hammer, shuffle, revive mechanics
│   │   │   └── __tests__/      # Jest unit test suites
│   │   ├── state/
│   │   │   └── useGameEngine.ts# State machine, undo history & audio triggers
│   │   ├── components/         # GameBoard, Tile, ScoreBoard, ControlBar, Modals
│   │   └── screens/            # GameScreen
│   ├── home/
│   │   └── screens/            # HomeScreen
│   ├── statistics/
│   │   └── screens/            # StatisticsModal
│   ├── settings/
│   │   └── screens/            # SettingsModal
│   └── shop/
│       ├── components/         # DailyRewardModal
│       └── screens/            # ShopModal
│
├── components/                 # Reusable UI system
│   ├── common/                 # Button, IconButton, Modal, Card, AdPlayerModal
│   └── ErrorBoundary.tsx       # Fault-tolerant exception recovery
│
├── services/                   # Business domain services
│   ├── storage/                # AsyncStorage wrapper with in-memory fallback
│   ├── sound/                  # Procedural Web Audio synthesizer
│   ├── haptics/                # Native Expo Haptics service
│   ├── ads/                    # Ad network controller & frequency caps
│   ├── currency/               # Local wallet & power-up inventory
│   ├── dailyReward/            # Calendar-based streak rewards
│   └── analytics/              # Telemetry & event logging
│
├── theme/                      # Design tokens & theming engine
│   ├── colors.ts               # Dark Slate, Classic, Neon palettes
│   ├── dimensions.ts           # Dynamic board & tile dimension calculator
│   ├── typography.ts           # Dynamic font scaler based on digits
│   ├── spacing.ts              # Spacing & border radius tokens
│   └── ThemeContext.tsx        # ThemeProvider & useTheme hook
│
└── types/                      # TypeScript definitions
    ├── game.ts
    ├── monetization.ts
    └── theme.ts
```

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | [React Native](https://reactnative.dev/) `0.86` + [Expo](https://expo.dev/) `SDK 57` |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) `v57` (File-based routing) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) `strict: true` |
| **Persistence** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |
| **Haptics** | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) |
| **Layout** | [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) |
| **Audio** | Procedural Web Audio API Synthesizer |
| **Testing** | [Jest](https://jestjs.io/) `29.7` + [ts-jest](https://kulshekhar.github.io/ts-jest/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.x` or `v22.x`
- npm `v10.x` or bun

### 1. Clone the repository
```bash
git clone https://github.com/itsyogeshnegi/Number-Merge-Game-App.git
cd Number-Merge-Game-App
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npx expo start
```

### 4. Target platforms
- **Web**: Press `w` or run `npm run web` (Opens in your browser at `http://localhost:8081`).
- **Android**: Press `a` or scan the QR code with the [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) app.
- **iOS**: Press `i` (macOS required) or scan the QR code with your iPhone camera via [Expo Go](https://apps.apple.com/app/expo-go/id982107779).

---

## 🧪 Automated Tests

The test suite covers full-grid creation, drag-to-merge verification, power-up execution, wallet balances, daily streak calculations, and storage corrupt-recovery:

```bash
# Run all unit test suites
npm test
```

```bash
PASS src/features/game/logic/__tests__/engine.test.ts
  Number Merge Drag-and-Drop Engine Tests
    Full Board Initialization
      ✓ creates board where EVERY box is filled with a random number (no empty cells)
      ✓ guarantees at least one valid merge exists on initialization
    Drag-to-Merge Validation ("Only upside down will merge, not far ones")
      ✓ allows vertical adjacent merge with same number (upside down)
      ✓ rejects drag merge if numbers are different
      ✓ strictly rejects far away tiles ("not far once go it")
      ✓ rejects diagonal tiles
    Drag Merge Execution & Refill
      ✓ merges 2+2 into 4, awards score, and refills the vacated box with a new random number
      ✓ merges 4+4 into 8, 8+8 into 16, 16+16 into 32
    Game Over & Win Detection
      ✓ detects game over when no adjacent tiles share matching numbers
      ✓ detects high tile and 2048 win state

PASS src/features/game/logic/__tests__/powerups.test.ts
PASS src/services/__tests__/services.test.ts

Test Suites: 3 passed, 3 total
Tests:       22 passed, 22 total
```

### TypeScript Validation & Health Check
```bash
# Typecheck
npx tsc --noEmit

# Expo Doctor diagnostic
npx expo-doctor
```

---

## 📦 Building for Production

Generate signed standalone release packages (`.apk`, `.aab`, `.ipa`) using Expo Application Services (EAS):

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Configure EAS
eas build:configure

# 4. Build for Android (Google Play Store AAB)
eas build --platform android --profile production

# 5. Build for iOS (Apple App Store IPA)
eas build --platform ios --profile production
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/itsyogeshnegi/Number-Merge-Game-App/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

<div align="center">

Crafted with ❤️ by [Yogesh Negi](https://github.com/itsyogeshnegi)

</div>