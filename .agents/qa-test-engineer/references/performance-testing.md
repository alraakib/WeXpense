# Performance & Load Testing Reference

## Load Testing Tools

### k6 (Recommended)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

### Locust (Python)
```python
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def index(self):
        self.client.get("/")
```

### Artillery (Node.js)
```yaml
config:
  target: http://localhost:3000
  phases:
    - duration: 60
      arrivalRate: 10
      rampTo: 50
scenarios:
  - flow:
      - get:
          url: "/api/users"
```

## Performance Test Types
| Type | Purpose | Duration | Example |
|------|---------|----------|---------|
| **Load Test** | Normal traffic behavior | 10-60 min | 100 concurrent users |
| **Stress Test** | Break point identification | 5-15 min | Ramp to 1000 users |
| **Spike Test** | Sudden traffic surge | 1-5 min | 0 to 500 users instantly |
| **Soak Test** | Memory leak detection | 1-12 hr | 50 users for 8 hours |
| **Endurance Test** | Long-term stability | 24+ hr | 50 users for 48 hours |

## Performance Metrics
- **Latency**: p50, p90, p95, p99 response times
- **Throughput**: Requests per second (RPS)
- **Error Rate**: % of failed requests
- **Resource Usage**: CPU, memory, disk I/O, network
- **GC Activity**: Young/old gen collections, pause times
- **Connection Pool**: Active/idle/waiting connections
- **Database**: Slow queries, connection count, replication lag

## Performance Testing Best Practices
- Test in production-like environment (same hardware, network, data volume)
- Baseline before and after changes
- Monitor system resources during tests
- Use synthetic data representative of production
- Run performance tests in CI/CD pipeline
- Set performance budgets (thresholds) that break the build
- Warm up the system before collecting measurements
- Test with realistic user behavior (think time, varying load)
- Test at different times of day (cron jobs, batch processes)
- Document performance characteristics (expected RPS, latency, scaling)

## Bottleneck Analysis

### Common Bottlenecks
- **CPU-bound**: Computation-heavy logic, serialization, encryption
- **Memory-bound**: Large heap, memory leaks, garbage collection
- **I/O-bound**: Database queries, file reads, network calls
- **Lock Contention**: Synchronized blocks, database row locks
- **Connection Limits**: Database/REDIS connection pool exhaustion

### Profiling Tools
- **Node.js**: Node.js --prof, clinic.js, 0x, Chrome DevTools
- **Python**: cProfile, Py-Spy, memory_profiler
- **Java**: JProfiler, YourKit, async-profiler, JFR
- **Go**: pprof, trace, benchstat
- **General**: perf (Linux), strace, iostat, dstat
