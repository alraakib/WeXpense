# JavaScript/TypeScript Runtimes

## Node.js

### Core Concepts
- **Event Loop**: Single-threaded, non-blocking I/O model
- **V8 Engine**: Google's JavaScript engine for high performance
- **libuv**: Cross-platform async I/O library
- **npm/yarn/pnpm**: Package managers
- **ESM & CJS**: Module system support

### Key APIs
- `http`/`https`: HTTP server and client
- `fs`: File system operations (use `fs/promises` for async)
- `crypto`: Cryptographic functionality
- `stream`: Stream processing for large data
- `worker_threads`: True parallel execution
- `cluster`: Multi-process scaling
- `child_process`: External process execution

### Best Practices
- Use `fs/promises` instead of callback-based `fs`
- Implement proper error handling with `try/catch`
- Use `--permission` flag for restricted environments (Node.js v20+)
- Monitor event loop with `toobusy-js` or `perf_hooks`
- Use `process.env` for configuration (never hardcode secrets)
- Implement graceful shutdown handlers

### Performance
- Use worker threads for CPU-intensive tasks
- Implement connection pooling for databases
- Use streaming for large file operations
- Leverage `cluster` module for multi-core utilization
- Profile with `--inspect` and Chrome DevTools

---

## Bun

### Core Concepts
- **All-in-one**: Runtime, bundler, test runner, package manager
- **Native TypeScript**: Zero-config TS transpilation
- **Performance**: Written in Zig, faster than Node.js
- **Bun.serve()**: High-performance HTTP server
- **Built-in SQLite**: Native SQLite support

### Key APIs
- `Bun.serve()`: HTTP server with route handlers
- `Bun.file()`: Efficient file reading with lazy loading
- `Bun.spawn()`: Child process execution
- `Bun.sql`/`Bun.sqlite`: Database connections
- `Bun.CryptoHasher`: Fast hashing
- `Bun.sleep()`: Async delays
- `Bun.env` vs `process.env`: Better performance

### Configuration
- `bunfig.toml`: Bun-specific configuration
- `--preload` for global setup scripts
- `install.linker`: `"isolated"` or `"hoisted"`
- `install.globalStore`: Faster reinstalls

### Best Practices
- Use `Bun.serve()` over `node:http`
- Use `--bun` flag to ensure Bun runtime
- Use `workspace:*` in monorepos
- Use `bun.lock` (text lockfile) for version control
- Configure `install.exact = true` in production
- Implement health check endpoints
- Use `--filter` for selective operations in monorepos

---

## Deno

### Core Concepts
- **Secure by default**: Permissions model
- **Web Standard APIs**: Fetch, URL, etc.
- **TypeScript first**: Native TS support
- **No node_modules**: URL-based imports
- **Built-in tooling**: Formatter, linter, test runner

### Key APIs
- `Deno.serve()`: HTTP server with Web API Request/Response
- `Deno.readTextFile()`/`Deno.writeTextFile()`: File operations
- `Deno.connect()`: TCP connections
- `Deno.Command()`: Subprocess execution
- `Deno.env`: Environment variables
- `Deno.upgradeWebSocket()`: WebSocket support

### Permissions
- `--allow-net`: Network access
- `--allow-read`: File read access
- `--allow-write`: File write access
- `--allow-env`: Environment variable access
- `--allow-run`: Subprocess execution
- `--allow-ffi`: Foreign function interface

### Best Practices
- Use `Deno.serve()` with Web API Request/Response
- Leverage `import_map.json` for dependency management
- Use `deno.json` for configuration
- Implement proper permission checks
- Use `@std` standard library
- Deploy to Deno Deploy for edge computing
