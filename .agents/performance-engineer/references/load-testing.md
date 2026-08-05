# Load Testing & Benchmarking

## k6 (Grafana k6)

- **Scripting:** JavaScript/ES6+, HTTP/1.1, HTTP/2, gRPC, WebSocket, browser-level testing
- **Key exports:** `export let options = { vus: 10, duration: '30s' }`
- **Metrics:** `http_req_duration`, `http_req_failed`, `http_reqs`, `iterations`, `vus`
- **Thresholds:** `thresholds: { http_req_duration: ['p(95)<500'] }`
- **Scenarios:** ramp-up, constant, spike, stress, soak — `scenarios` block in options
- **Checks:** `check(res, { 'status is 200': (r) => r.status === 200 })`
- **Browser testing:** `k6 browser` — Playwright-compatible API for browser-level load
- **CI integration:** `grafana/k6` Docker image, exit codes based on thresholds

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp-up
    { duration: '5m', target: 100 },   // steady state
    { duration: '2m', target: 0 },     // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  let res = http.get('https://api.example.com/users');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

## Locust

- **Python-based:** Define user behavior as Python classes inheriting `HttpUser`
- **Tasks:** Decorators `@task(weight)`, `@tag`, sequential task sets
- **Web UI:** Real-time metrics dashboard at `http://localhost:8089`
- **Distributed:** Master + worker mode (`--master`, `--worker` flags)
- **Waiting time:** `wait_time = between(1, 5)` — realistic user think time
- **Custom metrics:** `self.environment.events.request_success.fire(...)`

```python
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(0.5, 3)

    @task(3)
    def view_items(self):
        self.client.get("/api/items")

    @task(1)
    def create_item(self):
        self.client.post("/api/items", json={"name": "test"})
```

---

## Artillery

- **YAML configuration:** Declarative, supports HTTP, WebSocket, Socket.io, gRPC
- **Phases:** `arrivalRate`, `rampTo`, `duration` for load patterns
- **Plugins:** `artillery-plugin-publish-metrics` (Datadog, Grafana), `artillery-plugin-faker`
- **Hooks:** `beforeRequest`, `afterResponse` callbacks for custom logic
- **Cluster mode:** `artillery run --worker` for distributed execution

```yaml
config:
  target: 'http://api.example.com'
  phases:
    - duration: 60
      arrivalRate: 10
      rampTo: 50
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.API_TOKEN }}'
scenarios:
  - name: 'Browse and checkout'
    flow:
      - get:
          url: '/api/products'
      - think: 2
      - post:
          url: '/api/orders'
          json:
            productId: '{{ $randomString() }}'
```

---

## Benchmarking Tools

- **wrk:** Multi-threaded HTTP benchmarking — `wrk -t12 -c400 -d30s http://localhost:3000`
- **hey:** HTTP load generator (Go), simpler than wrk — `hey -n 10000 -c 100 http://localhost:3000/api`
- **autocannon:** Node.js HTTP benchmarking — `npx autocannon -c 100 -d 30 -p 10 http://localhost:3000`
- **oha:** Rust-based, supports HTTP/2 — `oha -c 100 -z 30s http://localhost:3000`
- **vegeta:** Text-based, supports attack/report commands — `echo "GET http://localhost:3000" | vegeta attack -rate=500 -duration=30s | vegeta report`

```bash
# autocannon with connection rate pipelining
npx autocannon -c 100 -d 60 -p 10 --latency http://localhost:3000/api/users
```

---

## Performance Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **TPS** | Transactions per second (throughput) | As high as needed |
| **p50 latency** | Median response time | < 200ms |
| **p95 latency** | 95th percentile — typical worst case | < 500ms |
| **p99 latency** | 99th percentile — rare slow requests | < 1000ms |
| **p999 latency** | 99.9th percentile — outlier | < 3000ms |
| **Error rate** | % of non-2xx/3xx responses | < 1% (ideally 0%) |

- **Tail latency:** p99 and p999 matter more than p50 for user experience
- **Mean vs percentile:** Mean hides outliers; always track percentiles
- **Metrics collection:** Prometheus with histograms, InfluxDB, Datadog, Grafana

---

## Load Patterns

- **Constant (steady):** Fixed number of VUs for fixed duration — tests baseline capacity
- **Ramp-up / ramp-down:** Gradually increase load — finds inflection point/breaking point
- **Spike:** Sudden burst of traffic (10x-50x) — tests auto-scaling and circuit breakers
- **Stress:** Load beyond expected peak — tests failure mode/capacity ceiling
- **Soak (endurance):** Sustained load for hours — reveals memory leaks, GC issues, connection leaks
- **Step load:** Increment VUs in steps with recovery periods — finds precise saturation point

---

## Distributed Load Generation

- **k6 Cloud:** Grafana Cloud k6 for geo-distributed testing
- **Locust master/worker:** Separate machines, TCP-based coordination
- **Artillery cluster:** `--worker` and `--master` for multi-node distribution
- **AWS distributed testing:** EC2 fleet coordinated via SSM or SQS
- **Key considerations:** Clock synchronization, aggregation of metrics across nodes, network latency variance

---

## Flame Graphs & CPU Profiles

- **Flame graph generation:** `0x` (auto-stack sampling), `perf` + `FlameGraph` scripts
- **Interpreting flame graphs:** X-axis = stack frequency, Y-axis = call stack depth. Wide bars = hot paths.
- **CPU profiles from k6:** `k6 run --profiling` generates CPU profiles of the load generator itself
- **Node.js profiling during load:** `node --prof --prof-process` during test for server-side flame graph
- **Critical path analysis:** Identify slowest synchronous operation in the stack trace
- **FlameScope:** Netflix tool for visualizing latency patterns by time + stack frequency
