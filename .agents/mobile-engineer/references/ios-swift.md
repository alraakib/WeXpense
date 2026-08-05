# iOS Development with Swift/SwiftUI

## SwiftUI Property Wrappers
- **`@State`**: Local view state, value type, triggers redraw on mutation
- **`@Binding`**: Read/write reference to external `@State`, passes down hierarchy
- **`@ObservedObject`**: Reference type conforming to `ObservableObject`, re-renders on `@Published` changes
- **`@StateObject`**: Owns the ObservableObject lifecycle (iOS 14+), use over `@ObservedObject` for creation
- **`@EnvironmentObject`**: Injected via `.environmentObject()`, shared across view tree
- **`@AppStorage`**: Wrapper around `UserDefaults`, persists small values
- **`@SceneStorage`**: State restoration scoped to scene, iOS 14+
- **`@FocusState`**: Manages first responder / focus state in forms
- **`@ScaledMetric`**: Dynamic type scaling for custom measurements

```swift
struct CounterView: View {
    @State private var count = 0
    @AppStorage("username") var username: String = ""

    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") { count += 1 }
            TextField("Name", text: $username)
        }
    }
}
```

## UIViewController Representable
- **`UIViewRepresentable`**: Wrap UIKit views (`makeUIView`, `updateUIView`)
- **`UIViewControllerRepresentable`**: Wrap UIKit view controllers (`makeUIViewController`, `updateUIViewController`)
- Coordinator pattern: `makeCoordinator()` for UIKit delegates / target-action

```swift
struct MapView: UIViewRepresentable {
    @Binding var region: MKCoordinateRegion

    func makeUIView(context: Context) -> MKMapView {
        let map = MKMapView()
        map.delegate = context.coordinator
        return map
    }
    func updateUIView(_ uiView: MKMapView, context: Context) {
        uiView.setRegion(region, animated: true)
    }
    func makeCoordinator() -> Coordinator { Coordinator(self) }
}
```

---

## Swift Concurrency
- **`async/await`**: Structured concurrency, `Task { }` for fire-and-forget
- **`Task`**: Creates async context, returns `Task<T, Error>`, cancellable via `task.cancel()`
- **`Task.detached`**: Unstructured concurrency, no parent task inheritance
- **`async let`**: Run multiple concurrent async calls, await results together
- **`withThrowingTaskGroup`**: Dynamic number of concurrent tasks
- **`MainActor`**: Ensures UI updates on main thread, annotate class/method
- **`@MainActor`**: Attribute on classes or functions to run on main actor
- **Actors**: `actor` keyword, protect mutable state, reentrant by default
- **`Sendable`**: Protocol for types safe to pass across concurrency domains
- **Continuations**: `withCheckedContinuation` / `withUnsafeContinuation` to bridge callback APIs

```swift
actor DataStore {
    private var cache: [String: Data] = [:]
    func fetch(_ key: String) async throws -> Data {
        if let cached = cache[key] { return cached }
        let data = try await URLSession.shared.data(from: URL(string: key)!).0
        cache[key] = data
        return data
    }
}
```

## Core Data / SwiftData
- **Core Data**: `NSPersistentContainer`, `NSManagedObjectContext`, `NSFetchRequest`
- **`@FetchRequest`**: SwiftUI property wrapper, auto-refreshes on changes
- **SwiftData** (iOS 17+): `@Model`, `@Query`, `ModelContainer`, `ModelContext`
- Lightweight migration: Automatic for simple schema changes
- Heavyweight migration: Custom mapping model, versioning
- Preload persistent store with seed data, use `NSPersistentCloudKitContainer` for iCloud sync

```swift
import SwiftData

@Model
final class Item {
    var name: String
    var createdAt: Date
    @Relationship(inverse: \Category.items) var category: Category?

    init(name: String) {
        self.name = name
        self.createdAt = .now
    }
}
```

---

## Combine Framework
- **`Publisher`**: Emits values over time (`Just`, `Future`, `PassthroughSubject`, `CurrentValueSubject`)
- **`Subscriber`**: Receives values (`sink`, `assign`)
- **Operators**: `map`, `filter`, `compactMap`, `flatMap`, `debounce`, `throttle`, `combineLatest`, `zip`, `merge`, `switchToLatest`
- **`@Published`**: Property wrapper, emits through projected `$publisher`
- **`ObservableObject`**: Object with `objectWillChange` publisher (used in SwiftUI)
- **Cancellables**: Store in `Set<AnyCancellable>`, lifecycle management
- **`URLSession.dataTaskPublisher`**: Network requests as publishers

```swift
class SearchViewModel: ObservableObject {
    @Published var query = ""
    @Published var results: [String] = []
    private var cancellables = Set<AnyCancellable>()

    init() {
        $query
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .flatMap { query in
                api.search(query).catch { _ in Just([]) }
            }
            .assign(to: \.results, on: self)
            .store(in: &cancellables)
    }
}
```

## URLSession Networking
- `URLSession.shared` for simple requests, custom `URLSessionConfiguration` for timeouts/caching
- `URLSession.data(from:)` async/await, `dataTaskPublisher` for Combine
- `URLSessionDelegate` for SSL pinning, custom auth challenges
- Background sessions: `URLSessionConfiguration.background` for uploads/downloads
- `URLCache` with memory + disk cache, `URLCredentialStorage` for credentials
- `Codable` + `JSONEncoder`/`JSONDecoder` for request/response serialization

---

## Xcode Project Structure
- **`*.xcodeproj`**: Legacy project format (conflict-prone)
- **`*.xcworkspace`**: Workspace with multiple projects + CocoaPods
- **SPM packages**: Integrated via `File > Add Packages`, `Package.swift` dependency
- **`.xcconfig`**: Build settings as key-value files, shareable across targets
- **Info.plist / InfoPlist.xcsettings**: Permissions, configuration, bundle metadata
- **Build phases**: Sources, Resources, Frameworks, Script build phases (e.g., SwiftLint, sourcery)
- **Schemes**: Run/Test/Profile/Analyze/Archive, shared schemes committed to repo

## Code Signing
- **Development certificates**: Installed via Xcode automatic signing or manual
- **Distribution certificates**: Apple Distribution, Ad Hoc, Enterprise
- **Provisioning profiles**: Development, Ad Hoc, App Store, Enterprise
- **App IDs**: Explicit or wildcard, bundled with capabilities (push, iCloud, etc.)
- **Team provisioning profile**: Auto-managed by Xcode
- **fastlane match**: Encrypted Git repo, syncs certificates + profiles across team
- **`security find-identity -v -p apple`**: List installed signing identities

## App Store Deployment
- **App Store Connect**: Create app record, set pricing, configure in-app purchases
- **TestFlight**: Internal testers (up to 100, no review), external testers (requires Beta App Review)
- **Xcode Archive**: Product > Archive, Organizer window for validation + distribution
- **App Review Guidelines**: 4.2 minimum functionality, 2.3 accurate metadata, 5.1 privacy
- **Phased releases**: Enable in App Store Connect, gradual rollout over 7 days
- **App Privacy**: Nutrition labels in App Store Connect, required since Dec 2020
- **Export compliance**: Apple encrypts all apps, submit or declare exemption

## SPM Dependency Management
- `Package.swift` manifest with `dependencies`, `targets`, `products`
- Version pinning: `.exact("1.2.3")`, `.upToNextMajor(from: "1.0.0")`, `.upToNextMinor(from: "1.2.0")`
- Binary targets: `.binaryTarget(path:)` for pre-compiled frameworks
- Local packages: Relative path for in-project modules
- Resolve packages: `File > Packages > Resolve Package Versions` or `xcodebuild -resolvePackageDependencies`
