# Performance Optimization Reference

## Metrics
- **Core Web Vitals**: LCP (<2.5s), FID/INP (<100ms), CLS (<0.1)
- **Backend**: p50/p95/p99 latency, RPS, error rate, GC pauses
- **Resources**: CPU, memory, disk I/O, network, connection pool
- **Budgets**: JS <200KB, CSS <50KB, FCP <1.8s, TTI <3.5s

## Frontend Optimization
- Code splitting with React.lazy + Suspense
- Image optimization: WebP/AVIF, srcset, lazy loading, blur placeholder
- Font optimization: self-host, subset, font-display: swap
- Bundle analysis: Webpack Bundle Analyzer, Vite Rollup Visualizer
- Cache: HTTP (Cache-Control, ETags), Service Workers (Workbox)
- Rendering: virtualization (react-window), memoization, list pagination
- CSS: critical CSS inlining, purge unused CSS, CSS modules

## Backend Optimization
- Caching: Redis, CDN, HTTP caching, application cache
- Async processing: message queues, background jobs
- Database: indexing, connection pooling, read replicas, query optimization
- Compute: worker threads, clustering, serverless offloading
- Network: compression, keep-alive, HTTP/2, protocol buffers

## Profiling Commands
- Node: `node --prof`, clinic.js, 0x, Chrome DevTools
- Python: cProfile, Py-Spy, memory_profiler
- Java: async-profiler, JFR, JProfiler
- Go: pprof, trace
- System: perf, strace, iostat, dstat, htop

## Load Testing
- k6: Scriptable, high-performance, CI integration
- Locust: Python-based, distributed
- Artillery: YAML-configured, Node.js
- WRK/Hey: Simple HTTP benchmarking
