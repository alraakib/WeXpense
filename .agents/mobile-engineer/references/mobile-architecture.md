# Mobile Architecture Patterns and Testing

## MVVM
- **Model**: Data layer (network, database, repositories)
- **View**: UI layer, observes ViewModel state, sends user intents
- **ViewModel**: Holds UI state (`StateFlow` / `@Published`), handles business logic
- View never holds reference to ViewModel lifecycle — survives config changes
- `viewModelScope` (Android), `ObservableObject` (iOS) for lifecycle-aware state

```swift
// iOS MVVM
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false

    func load() async {
        isLoading = true
        defer { isLoading = false }
        user = try? await api.fetchProfile()
    }
}
```

## MVI
- **Intent**: User action modeled as sealed class / enum
- **Processor**: Reducer-like function, intents in → states out
- **State**: Single immutable state object per screen
- **Side Effects**: One-shot events (toasts, navigation) via `SharedFlow` / `PassthroughSubject`
- Unidirectional data flow: `View → Intent → Processor → State → View`

```kotlin
// Android MVI
sealed class LoginIntent {
    data class EmailChanged(val email: String) : LoginIntent()
    data class PasswordChanged(val password: String) : LoginIntent()
    data object Submit : LoginIntent()
}

data class LoginState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
)
```

## Clean Architecture
- **Presentation**: ViewModels, Composables / SwiftUI Views
- **Domain**: Use cases, repository interfaces, domain models (pure Kotlin/Swift)
- **Data**: Repository implementations, DTOs, DAOs, API services
- Dependency rule: Inner layers know nothing about outer layers
- Use cases are single-responsibility classes (e.g., `GetUserUseCase`, `PlaceOrderUseCase`)

```
app/
├── presentation/
│   ├── viewmodel/
│   └── ui/
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
└── data/
    ├── repository/
    ├── local/
    └── remote/
```

---

## Offline-First
- **Local-first**: Write to local DB first, sync to server asynchronously
- **WatermelonDB**: SQLite-based, lazy loading, sync adapter protocol, used in production (Nozbe)
- **RxDB**: Reactive NoSQL database, supports multi-tab, replication protocols
- **Sync strategies**: Operation queue → conflict resolution → push/pull
- **CRDT**: Conflict-free replicated data types for multi-device sync
- **Last-write-wins (LWW)**: Timestamp-based conflict resolution
- **Optimistic UI**: Apply mutations instantly, revert on server error
- **Reachability**: Monitor via `NetInfo` (RN), `NWPathMonitor` (iOS), `ConnectivityManager` (Android)
- **Background sync**: `BGTaskScheduler` (iOS), `WorkManager` (Android), react-native-background-fetch

## Push Notifications
- **FCM**: Firebase Cloud Messaging for Android + iOS via Firebase
- **APNs**: Apple Push Notification service, device tokens, certificate-based auth
- **Notification payloads**: `alert`, `badge`, `sound`, `data` (silent), `category` (action buttons)
- **Notification categories**: Predefined actions (reply, approve, dismiss)
- **Notification channels**: Android 8+ categories (importance: urgent, high, medium, low)
- **Rich notifications**: Media attachments (images, video, audio) — iOS `UNNotificationAttachment`, Android `BigPictureStyle`
- **Silent push**: `content-available: 1` for background data sync (iOS)
- **Token management**: Register on login, refresh on token change, unregister on logout

## Deep Linking
- **URL scheme**: `myapp://profile/123` — custom scheme, static registration
- **Universal Links (iOS)**: `apple-app-site-association` file on server, verified HTTPS links
- **App Links (Android)**: `assetlinks.json` on server, auto-verified HTTPS
- **Dynamic Links**: Firebase Dynamic Links (now deprecated, use custom or branch.io)
- **Navigation handling**: Parse URI → map to screen → pass params
- **Fallback**: Open browser/Play Store if app not installed

```kotlin
// Android deep link filter in AndroidManifest.xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="example.com" android:pathPrefix="/profile" />
</intent-filter>
```

---

## Biometric Auth
- **iOS**: `LocalAuthentication` framework — `LAContext().evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics)`
- **Android**: `BiometricPrompt` with `BiometricManager` — check `BIOMETRIC_SUCCESS`
- **Face ID**: Requires `NSFaceIDUsageDescription` in Info.plist
- **Fallback**: Passcode/PIN as secondary auth method
- **Storage**: Store tokens in Keychain (iOS) / EncryptedSharedPreferences (Android)
- **Crypto integration**: Use `SecAccessControl` (iOS) / `BiometricPrompt.CryptoObject` (Android) to bind decryption to biometric

## E2E Testing
- **Detox** (React Native): Gray-box testing, synchronizes with app via idle/busy
  - `device.reloadReactNative()`, `element(by.id('button')).tap()`, `expect(element(by.text('Hello'))).toBeVisible()`
  - Requires iOS simulator build config: `-DIOS_ENABLE_HEADER_SWAPPING`
- **Maestro**: Cross-platform (iOS + Android) mobile E2E
  - YAML-based flows: `appId: com.example.app`, `- tapOn: "Login"`, `- assertVisible: "Welcome"`
  - Built-in waits, native gesture support, swipe/scroll/back actions
- **XCTest** (iOS UI Testing): `XCUIApplication`, `app.buttons["Login"].tap()`, `app.staticTexts["Hello"].waitForExistence(timeout: 5)`
- **Espresso** (Android UI Testing): `onView(withId(R.id.login)).perform(click())`, `IntentsTestRule` for verification
- **Cloud testing**: BrowserStack, Saucelabs, Firebase Test Lab for device matrix

## Crash Reporting
- **Sentry**: Cross-platform, breadcrumbs, context (device, OS, memory), release tracking
- **Crashlytics** (Firebase): Real-time crash reporting, non-fatals, custom keys, user identifiers
- **Symbolication**: Upload dSYM (iOS) / ProGuard mapping (Android) for readable stacktraces
- **Non-fatal errors**: `Sentry.captureException(error)` / `Firebase.crashlytics.recordException(error)` for caught errors
- **ANR tracking**: Firebase ANR detection, custom ANR watchdog for iOS

---

## Feature Flags
- **LaunchDarkly**: Flag evaluation, targeting rules, percentage rollouts, kill switches
- **Firebase Remote Config**: A/B testing, graduated rollouts, in-app config overrides
- **Flagship (flagsmith)**: Open-source, self-hosted option
- **Flag patterns**: Boolean flag for features enabled/disabled, multivariate for A/B test variants
- **Stale flags**: Remove after full rollout to reduce code complexity
- **Kill switch**: Emergency flag to disable feature without app store update

## Performance
- **Startup time**: Remove unnecessary `Application.onCreate` work, defer SDK init, use SplashScreen API
- **App size**: Hermes (RN), R8/ProGuard shrinker, Android App Bundles (on-demand delivery), asset compression
- **Memory**: Avoid `Activity`/`View` leaks, use `WeakReference` for callbacks, image caching (`Coil`/`Glide`/`Kingfisher`)
- **Battery**: Batch network calls with `WorkManager` / `BGTaskScheduler`, minimize GPS polling, reduce wake locks
- **Network latency**: HTTP/2 multiplexing, response caching, preconnect to API hosts, compressed payloads
- **Threading**: Keep main thread free — move I/O to background, use Kotlin Flow `flowOn(IO)` / Swift `Task.detached`
- **Profiling tools**: Xcode Instruments (Time Profiler), Android Studio Profiler, Flipper, Systrace

## Mobile CI/CD
- **fastlane**: `lane :beta do` — gym (build), scan (test), match (signing), pilot (TestFlight), deliver (App Store)
- **Bitrise**: Workflow-based mobile CI (steps for code signing, build, test, deploy)
- **GitHub Actions**: macOS runners for iOS, ubuntu runners for Android
- **Code signing**: fastlane match (iOS), keystore in encrypted env vars (Android)
- **Distribute**: TestFlight (iOS), Google Play internal/closed track (Android)
- **Artifacts**: Export .ipa / .aab, upload to artifact storage, attach to release notes
- **Monorepo**: Filter triggers by changed paths (e.g., `packages/mobile/**`)
