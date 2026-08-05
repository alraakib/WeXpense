# Database Migration & Change Management Reference

## Migration Tools

### Flyway (Java, SQL)
```sql
-- V1__create_users.sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
- Versioned migrations (V1__, V2__)
- Repeatable migrations (R__ or U__)
- Checksums for integrity
- Undo migrations for rollback

### Liquibase (Java, XML, YAML, JSON, SQL)
```yaml
databaseChangeLog:
  - changeSet:
      id: 1
      author: developer
      changes:
        - createTable:
            tableName: users
            columns:
              - column: { name: id, type: bigint, autoIncrement: true, constraints: { primaryKey: true } }
              - column: { name: email, type: varchar(255), constraints: { nullable: false } }
```
- Declarative changesets with rollback
- Context-specific migrations
- Diff tool for comparing databases

### Prisma Migrate (Node.js)
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```
- Auto-generate migrations from schema changes
- TypeScript-first, type-safe client
- Database seeding with seed.ts

### Alembic (Python)
```python
# migrations/versions/0001_create_users.py
def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
    )

def downgrade():
    op.drop_table('users')
```

## Zero-Downtime Migration Patterns

### Adding a Column
1. Add column as nullable (no default)
2. Application updates to write new column
3. Backfill data in batches
4. Add NOT NULL constraint

### Changing a Column Type
1. Add new column with new type
2. Dual-write to both columns (application)
3. Backfill old data
4. Migrate reads to new column
5. Drop old column

### Renaming a Table/Column
1. Add new table/column
2. Dual-write to both
3. Application reads from new, falls back to old
4. Stop writing to old
5. Drop old table/column

### Splitting a Table
1. Create new table
2. Add triggers to keep in sync (or application dual-write)
3. Batch migrate data in small transactions
4. Switch reads to new table
5. Remove old references

### Best Practices
- Always have a rollback plan (down migration)
- Test on staging with production-size data
- Run during low-traffic periods (or use online schema change tools)
- Use `LOCK_TIMEOUT` to prevent blocking production queries
- For PostgreSQL: use `pgroll` (safe, automatic rollback support)
- For MySQL: use `gh-ost` (GitHub), `pt-online-schema-change` (Percona)
- For MongoDB: no strict schema, phased application changes instead
