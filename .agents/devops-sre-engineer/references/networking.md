# Networking Reference

## DNS
- **A Record**: Maps domain to IPv4
- **AAAA Record**: Maps domain to IPv6
- **CNAME**: Canonical name alias
- **MX**: Mail exchange
- **TXT**: Arbitrary text (SPF, DKIM, DMARC)
- **TTL**: Time-to-live for caching
- **Tools**: `dig`, `nslookup`, `host`, `nslookup`

## Load Balancing
- **Layer 4 (TCP/UDP)**: Forward traffic based on IP:port (NLB, HAProxy)
- **Layer 7 (HTTP/S)**: Content-based routing (ALB, Traefik, Nginx)
- **Algorithms**: Round-robin, Least connections, IP hash, Weighted
- **Health Checks**: Active (probes) and passive (connection tracking)
- **Session Persistence**: Sticky sessions via cookies or IP hash
- **TLS Termination**: At load balancer with certificate management

## Reverse Proxy (Nginx)
```nginx
upstream backend {
    server app1:3000 weight=3;
    server app2:3000;
    server app3:3000 backup;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## CDN
- **CloudFront, CloudFlare, Fastly, Akamai**
- Edge caching, DDoS protection, SSL termination
- Origin pull vs push distribution
- Cache invalidation strategies

## Service Mesh
- **Istio**: Envoy-based, mTLS, traffic management, telemetry
- **Linkerd**: Lightweight, Rust-based data plane
- **Consul**: Service mesh + service discovery
- Features: Circuit breaking, retries, timeouts, canary deployments, traffic splitting

## Network Security
- **TLS 1.3**: Modern encryption standard
- **mTLS**: Mutual TLS for service-to-service auth
- **DDoS Protection**: CloudFront, CloudFlare, AWS Shield
- **WAF**: Web Application Firewall (ModSecurity, AWS WAF)
- **IP Allow/Deny Lists**: Restrict access by source IP
- **Rate Limiting**: Per IP, per endpoint, sliding window
- **Zero Trust**: BeyondCorp, CloudFlare Zero Trust
