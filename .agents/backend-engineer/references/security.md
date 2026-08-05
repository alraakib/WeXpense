# Security Best Practices

## OWASP Top 10 (2021)
1. **Broken Access Control**: Implement proper authorization
2. **Cryptographic Failures**: Use strong encryption
3. **Injection**: Prevent SQL/NoSQL/Command injection
4. **Insecure Design**: Implement secure design patterns
5. **Security Misconfiguration**: Secure default configurations
6. **Vulnerable Components**: Keep dependencies updated
7. **Auth Failures**: Implement proper authentication
8. **Data Integrity Failures**: Validate data integrity
9. **Logging Failures**: Implement proper logging
10. **SSRF**: Prevent server-side request forgery

## Authentication

### JWT (JSON Web Tokens)
- Use short-lived access tokens (15-30 minutes)
- Use refresh tokens for token renewal
- Store tokens securely (httpOnly cookies)
- Implement token rotation
- Use strong signing keys

### OAuth 2.0
- Use Authorization Code flow with PKCE
- Implement proper scopes
- Validate state parameter
- Use HTTPS only

### Password Security
- Use bcrypt/argon2 for hashing
- Enforce strong password policies
- Implement account lockout
- Use rate limiting

## Input Validation

### Validation Libraries
- **Zod**: TypeScript-first validation
- **Joi**: Schema validation
- **class-validator**: Decorator-based validation
- **Yup**: Schema validation

### Best Practices
- Validate all input on server side
- Use allowlists over blocklists
- Sanitize output to prevent XSS
- Use parameterized queries
- Validate Content-Type headers

## Rate Limiting

### Libraries
- `express-rate-limit`: Express middleware
- `@fastify/rate-limit`: Fastify plugin
- `rate-limiter-flexible`: Flexible rate limiting

### Strategies
- **Fixed Window**: Simple time-based limiting
- **Sliding Window**: More accurate limiting
- **Token Bucket**: Smooth rate limiting
- **Leaky Bucket**: Constant rate processing

## Security Headers

### Helmet (Express)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Headers
- **Strict-Transport-Security**: HTTPS enforcement
- **X-Content-Type-Options**: Prevent MIME sniffing
- **X-Frame-Options**: Prevent clickjacking
- **X-XSS-Protection**: XSS protection
- **Content-Security-Policy**: Resource loading policy
- **Referrer-Policy**: Referrer information control
- **Permissions-Policy**: Feature policy

## CORS

### Configuration
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://example.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

## Error Handling

### Best Practices
- Don't expose internal errors to clients
- Use generic error messages
- Log detailed errors server-side
- Implement centralized error handling
- Use HTTP status codes correctly

## Secrets Management

### Best Practices
- Never commit secrets to version control
- Use environment variables
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use least privilege principle

## Dependency Security

### Tools
- `npm audit`: Check for vulnerabilities
- `snyk`: Security scanning
- `OWASP Dependency-Check`: Vulnerability detection

### Best Practices
- Regularly update dependencies
- Use lockfiles
- Implement automated security scanning
- Use private registries for internal packages

## Logging & Monitoring

### Libraries
- **Winston**: Most popular logger
- **Pino**: High-performance logger
- **Bunyan**: JSON logging

### What to Log
- Authentication events
- Authorization failures
- Input validation errors
- System errors
- API access logs

### What NOT to Log
- Passwords
- Credit card numbers
- Session tokens
- Personal identifiable information (PII)
