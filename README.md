# Lokal Music Player

A React Native Expo music streaming app built with the JioSaavn API.

## Features
- Search songs using the Saavn API
- Persistent mini player synced with full player
- Background playback with Expo AV
- Queue management with reorder and remove
- Shuffle and repeat modes
- Optional offline download of songs
- State persistence via AsyncStorage

## Architecture
- React Native Expo with TypeScript
- Navigation using React Navigation v6
- State management with Zustand and persistence middleware
- Audio playback using `expo-av`
- Data storage with `@react-native-async-storage/async-storage`

## Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the Expo development server
   ```bash
   npm start
   ```
3. Run on Android
   ```bash
   npm run android
   ```

## Trade-offs
- Used `expo-av` for background audio rather than a native track-player library to keep the project simple and Expo-managed.
- The app fetches search results directly from the public API with minimal caching.
- Downloaded songs are stored to the Expo document directory for offline listening.

## Notes
- If playback does not continue in the background on some Android/iOS environments, verify the device audio settings and Expo audio mode configuration.
- The queue is persisted locally, so tracks remain available after app restarts.
