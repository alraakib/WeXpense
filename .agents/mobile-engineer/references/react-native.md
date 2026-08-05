# React Native Reference

## Core Libraries
- **Navigation**: React Navigation (stack, tab, drawer, native-stack)
- **State**: Redux Toolkit, Zustand, Jotai
- **Networking**: React Query, Axios, Apollo Client
- **Storage**: MMKV, WatermelonDB, expo-sqlite
- **Forms**: React Hook Form + Zod
- **Animations**: Reanimated 3, Gesture Handler, Lottie
- **Lists**: FlashList (Shopify), SectionList, FlatList (fallback)
- **UI**: Tamagui, NativeBase, React Native Paper
- **Testing**: Jest + React Native Testing Library, Detox (E2E)
- **Profiling**: Flipper, React DevTools, Hermes Profiler

## Project Structure
```
src/
├── app/            # Navigation, providers, app config
├── screens/        # Screen-level components
├── features/       # Feature modules
├── components/     # Shared UI components
├── services/       # API clients
├── hooks/          # Shared hooks
├── store/          # Global state
├── theme/          # Design tokens
├── i18n/           # Localization
└── types/          # TypeScript types
```

## Best Practices
- Enable Hermes engine for production
- Use FlashList over FlatList for large lists
- Implement code splitting with React.lazy + Metro inline requires
- Optimize images: WebP format, cached with FastImage
- Use Fast Refresh for development
- Profile with Flipper before release
- Test on real devices, not just simulators
- Use TypeScript strictly
- Implement error boundaries
- Use react-native-reanimated (not Animated API) for animations

## iOS-Specific
- Swift/SwiftUI native modules
- Fastlane match for code signing
- Xcode Cloud or Bitrise for CI
- App Store Connect for TestFlight and distribution

## Android-Specific
- Kotlin/Jetpack Compose native modules
- Gradle configuration, ProGuard/R8
- Google Play Console for distribution

## Debugging
- Flipper: Network inspector, layout inspector, database explorer
- React Native DevTools: Components, Profiler
- Hermes Debugger: JavaScript debugging with Chrome DevTools
- Crash reporting: Sentry, Crashlytics (Firebase)
