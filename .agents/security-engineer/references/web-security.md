# Web Application Security Reference

## OWASP Top 10 (2025)
1. **Broken Access Control** — Insecure direct object references, missing function-level access control
2. **Cryptographic Failures** — Weak encryption, sensitive data exposure, improper key management
3. **Injection** — SQL, NoSQL, OS command, LDAP injection (use parameterized queries)
4. **Insecure Design** — Missing threat modeling, security-by-obscurity, business logic flaws
5. **Security Misconfiguration** — Default credentials, debug endpoints, excessive CORS, unpatched software
6. **Vulnerable Components** — Outdated libraries, unsupported software, unpatched CVEs
7. **Authentication Failures** — Weak passwords, credential stuffing, session fixation, missing MFA
8. **Data Integrity Failures** — Unsigned software updates, insecure CI/CD pipeline, CSRF
9. **Logging & Monitoring Failures** — Missing audit logs, no alerting, insufficient forensic data
10. **SSRF** — Server-side request forgery, cloud metadata endpoint exposure

## OWASP Cheat Sheets (Key Topics)
- **Authentication**: Password policies, MFA, OAuth2/OIDC, session management
- **Authorization**: RBAC, ABAC, permission inversion, least privilege
- **Input Validation**: Allowlist vs blocklist, schema validation, encoding
- **SQL Injection Prevention**: Parameterized queries, prepared statements, ORM usage
- **XSS Prevention**: Context-aware output encoding, CSP headers, sanitization
- **CSRF Prevention**: Anti-CSRF tokens, SameSite cookies, re-authentication
- **SSRF Prevention**: URL allowlists, disable http/https redirects, network segmentation
- **Deserialization**: Type checking, integrity verification, avoiding native deserialization
- **Cryptographic Storage**: Modern algorithms (AES-256, Argon2, bcrypt), key rotation
- **File Upload**: Validate type, size, content; store outside webroot; scan for malware
- **Logging**: Log auth events, access control failures, input validation errors; never log secrets
- **Container Security**: Minimal base images, non-root user, read-only rootfs, vulnerability scanning

## Authentication & Authorization

### Authentication
- **Password-based**: bcrypt (cost 10+) or Argon2id for hashing, rate limiting on login, account lockout
- **Multi-Factor (MFA)**: TOTP (RFC 6238), WebAuthn/passkeys, SMS backup (avoid SMS-only)
- **OAuth 2.0 / OIDC**: Authorization Code flow + PKCE, state parameter, proper redirect_uri validation
- **JWT**: Short-lived access tokens (15-30 min), refresh tokens (7-30 days) stored in httpOnly secure cookies
- **Session Management**: Secure (httpOnly, SameSite, Secure) cookies, session ID rotation on login

### Authorization
- **RBAC**: Role-Based Access Control with hierarchical roles
- **ABAC**: Attribute-Based Access Control for fine-grained policies
- **Permission Inversion**: Default-deny, explicit allow
- **Centralized**: Policy Enforcement Point (PEP) / Policy Decision Point (PDP) pattern
- **API Auth**: API keys for machine-to-machine, OAuth for user-facing, JWT for stateless
- **Principle**: Always verify authorization server-side, never trust client-side claims

## CORS Configuration
```json
{
  "Access-Control-Allow-Origin": "https://trusted-frontend.example.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": 86400
}
```
- Never use `Access-Control-Allow-Origin: *` with credentials
- Use allowlist of origins, not wildcards
- Restrict methods and headers to minimum needed

## Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```
