# Android Development with Kotlin/Jetpack Compose

## Jetpack Compose Basics
- **`@Composable`**: Annotates UI functions, emits UI hierarchy
- **`Modifier`**: Chainable layout/decoration (`.fillMaxSize()`, `.padding()`, `.clickable{}`)
- **State**: `mutableStateOf()`, `remember { mutableStateOf() }`, `rememberSaveable { }` survives config changes
- **`LaunchedEffect`**: Run suspend functions in composable scope, cancels on recomposition
- **`DisposableEffect`**: Setup/cleanup lifecycle for observers, listeners
- **`sideEffect`**: Runs on every recomposition, for non-Compose state sync
- **`derivedStateOf`**: Compute derived state efficiently (avoid recomposition)
- **`rememberCoroutineScope`**: Access coroutine scope outside `LaunchedEffect`
- **`snapshotFlow`**: Convert Compose state to `Flow`

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Count: $count", style = MaterialTheme.typography.headlineLarge)
        Button(onClick = { count++ }) { Text("Increment") }
    }
}
```

## Kotlin Coroutines and Flow
- **Coroutine scopes**: `viewModelScope`, `rememberCoroutineScope`, `lifecycleScope`
- **Dispatchers**: `Dispatchers.Main` (UI), `IO` (network/disk), `Default` (CPU-heavy), `Unconfined`
- **`async/await`**: Structured concurrency for parallel work
- **`Flow<T>`**: Cold async stream, emits values over time
- **`StateFlow<T>`**: State holder, always has current value, hot
- **`SharedFlow<T>`**: Event stream, configurable replay/replayCache
- **Terminal operators**: `.collect{}`, `.single()`, `.toList()`
- **Intermediate operators**: `.map`, `.filter`, `.flatMapLatest`, `.combine`, `.zip`
- **`flowOn(Dispatchers.IO)`**: Change context upstream
- **`.catch{}`**: Handle upstream exceptions gracefully

```kotlin
class SearchViewModel : ViewModel() {
    private val _query = MutableStateFlow("")
    val uiState: StateFlow<SearchUiState> = _query
        .debounce(300)
        .flatMapLatest { searchRepo.search(it) }
        .map { SearchUiState.Success(it) as SearchUiState }
        .catch { emit(SearchUiState.Error(it.message ?: "Unknown")) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SearchUiState.Loading)

    fun search(query: String) { _query.value = query }
}
```

---

## Room Database
- `@Entity` → table, `@PrimaryKey`, `@ColumnInfo`, `@ForeignKey`, `@Index`
- `@Dao` → interface with `@Insert`, `@Update`, `@Delete`, `@Query`
- `@Database` → abstract class extending `RoomDatabase()`
- **Type converters**: `@TypeConverter` for custom types (Date, List, etc.)
- **Migrations**: `Migration(startVersion, endVersion)` with `ALTER TABLE` SQL
- **`Flow<T>` return type**: Auto-observes, re-emits on table changes
- **`@Transaction`**: Multiple DAO calls in one transaction

```kotlin
@Entity(tableName = "users")
data class User(
    @PrimaryKey val id: Long,
    val name: String,
    val email: String
)

@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAll(): Flow<List<User>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: User)
}
```

## Hilt / Dagger DI
- **`@HiltViewModel`**: Injects into ViewModel automatically
- **`@Inject`**: Constructor injection, field injection
- **`@Module` / `@Provides` / `@Binds`**: Define providers for interfaces
- **`@Singleton`**: Scoped to application lifetime
- **`@ViewModelScoped`**: Lives as long as ViewModel (Hilt)
- **`@ActivityScoped`**, **`@FragmentScoped`**: Scoped to lifecycle
- **`@HiltAndroidApp`**: Application class annotation
- **`@AndroidEntryPoint`**: Activities, Fragments, Views, Services, BroadcastReceivers

---

## Retrofit + OkHttp
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun provideOkHttp(): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) BODY else NONE
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_URL)
        .client(client)
        .addConverterFactory(MoshiConverterFactory.create())
        .build()
}

interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: Long): User

    @POST("orders")
    suspend fun createOrder(@Body order: Order): OrderResponse
}
```

## Navigation Compose
- **`NavHost`**, **`NavController`**: Define composable destinations
- **`composable("route/{param}")`**: Route with argument, accessed via `backStackEntry.arguments`
- **`navController.navigate("route")`**: Navigate to destination
- **`popBackStack()`**, **`navigateUp()`**: Back navigation
- **`NavType`**: String, Int, Boolean, Parcelable type arguments
- **Deep linking**: `deepLinks = listOf(navDeepLink { uriPattern = "app://.../{id}" })`
- **Bottom navigation**: `Scaffold` + `NavigationBar` + `NavigationBarItem` with `NavController`
- **Safe Args**: Type-safe navigation using serializable route classes (Compose Navigation 2.8+)

---

## Gradle Build System (KTS)
- `build.gradle.kts` — Kotlin DSL for build configuration
- **`libs.versions.toml`**: Version catalog (centralized dependency management)
- **Product flavors**: `flavorDimensions("tier")`, `productFlavors { free { } paid { } }`
- **Build types**: `release` (minify, shrinkResources), `debug` (debuggable, test coverage)
- **`BuildConfig`**: Custom fields via `buildConfigField("String", "API_URL", "...")`
- **`com.android.application`** vs **`com.android.library`** plugin
- **Variant-aware**: Source sets `src/release/`, `src/debug/`, `src/flavorName/`

```kotlin
android {
    compileSdk = 35
    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
```

## Google Play Console
- **Testing tracks**: Internal (100 testers, no review), Closed (up to 9999), Open (public beta), Production
- **App signing**: Play App Signing (Google manages upload key, user manages app signing key)
- **In-app products**: One-time purchases (`inapp`), subscriptions (`subs`)
- **Managed publishing**: Hold for manual release instead of auto-publish
- **Pre-registration**: For upcoming apps, notifies interested users
- **Android App Bundle (AAB)**: Required format for Play Store, dynamic delivery
- **Store listing**: Screenshots, feature graphic, description, content rating, target audience

## ProGuard / R8
- R8 is default shrinker (replaced ProGuard in AGP 3.4+)
- Keep rules: `-keep class com.example.model.** { *; }`
- Keep JSON model classes (`@Serializable`, `@Keep`)
- `-dontwarn` for missing optional dependencies
- `-keepattributes Signature, *Annotations*`
- `consumer-rules.pro` for library modules
- Test release builds before submission: `assembleRelease` + `Bundle` with ProGuard mapping

## Material 3 / Material You
- **`MaterialTheme`**: `colorScheme`, `typography`, `shapes` — dynamic theming
- **Dynamic color**: `dynamicLightColorScheme(context)` / `dynamicDarkColorScheme(context)` (Android 12+)
- **Components**: `Scaffold`, `TopAppBar`, `NavigationBar`, `FloatingActionButton`, `Card`, `BottomSheet`
- **`@Composable`** slots: `content`, `trailingIcon`, `leadingContent` for customizable layout
- **`MaterialTheme.colorScheme.primary`**, `.surface`, `.onSurface`, `.secondaryContainer`
- **Adaptive layouts**: `WindowSizeClass` for foldable/tablet responsiveness
- **Edge-to-edge**: `enableEdgeToEdge()` in Activity, system bar handling via `WindowInsets`
