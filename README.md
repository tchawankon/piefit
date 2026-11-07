# PieFit

Offline-first fitness app for rings, TRX, bodyweight and gym training, plus yoga, habits, nutrition and more. Installable as a web app (PWA) and available as an Android app. Thai and English.

Open: https://tchawankon.github.io/piefit/

## Features

**Strength training**
- Calibration test to find your starting level
- Suggested reps and weights each session (double progression)
- Swap any exercise for another that trains the same muscles
- Progression paths with unlockable steps (rings and bodyweight)
- Weekly sets per muscle against adjustable targets

**Personal trainer**
- Daily readiness and effort tracking
- Weekly plan, saved routines, review and goals
- Form check with your camera (runs on the device)
- Optional AI coach

**Yoga, video and other activity**
- Yoga and stretching with levels and follow-along classes
- Video workout classes
- Log pilates, swimming, sports and other activity

**Daily life**
- Habits and a 30-day challenge
- Food tab with nutrition tracking and optional AI food logging
- Weight tracking with a goal and trend
- Monthly calendar
- Sounds and voice cues
- Export / import backup

## Privacy

Your data stays on your device (localStorage and IndexedDB). Use export / import to back it up. The app works fully offline.

The optional AI features (coach, Food tab) send the text you type directly from your browser to the AI provider whose key you enter (Anthropic Claude, Google Gemini or OpenAI). Nothing goes to a PieFit server.

## Tech

Plain HTML and JavaScript, no build step. The Android APK is built with Capacitor. Contributors and AI sessions: start at `CLAUDE.md`.
