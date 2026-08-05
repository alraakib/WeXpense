# Backup & Recovery Reference

## Strategies

### RPO/RTO Definitions
- **RPO (Recovery Point Objective)**: Maximum acceptable data loss (time-based)
- **RTO (Recovery Time Objective)**: Maximum acceptable downtime

### Backup Types
- **Full Backup**: Complete database copy
- **Incremental Backup**: Changes since last backup (any type)
- **Differential Backup**: Changes since last full backup
- **Point-in-Time Recovery (PITR)**: WAL/transaction log replay

## PostgreSQL
```bash
# Full backup (custom format, compressed, parallel)
pg_dump -Fc -j 4 -h host -U user db > db.dump

# Full cluster backup
pg_dumpall -h host -U user > all.sql

# PITR with WAL archiving (postgresql.conf)
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# Restore
pg_restore -j 4 -d db db.dump

# WAL-based PITR
# 1. Restore base backup
# 2. Set recovery.conf
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2024-01-01 00:00:00'

# Continuous archiving with pgBackRest
pgbackrest --stanza=main --type=full backup
pgbackrest --stanza=main --type=incr backup
pgbackrest --stanza=main --delta restore
```

## MySQL
```bash
# Logical backup
mysqldump -h host -u user -p --single-transaction --routines --triggers db > db.sql

# Physical backup with Percona XtraBackup
xtrabackup --backup --target-dir=/backup
xtrabackup --prepare --target-dir=/backup
xtrabackup --copy-back --target-dir=/backup

# PITR with binary logs
mysqlbinlog binlog.000001 binlog.000002 | mysql -u user -p

# Automated backup with mysqlbackup (MySQL Enterprise)
mysqlbackup --backup-dir=/backup backup
mysqlbackup --backup-dir=/backup apply-log
mysqlbackup --backup-dir=/backup copy-back
```

## MongoDB
```bash
# Logical backup
mongodump --uri="mongodb://host:27017/db" --out=/backup/$(date +%Y%m%d)

# Logical restore
mongorestore --uri="mongodb://host:27017/db" --drop /backup/20240101

# Archive format (streamable)
mongodump --archive --uri="mongodb://host:27017/db" > db.archive
mongorestore --archive < db.archive

# File-system snapshot (EBS, LVM)
# Requires journaling and locked database
```

## Redis
```bash
# Save RDB snapshot
redis-cli SAVE
redis-cli BGSAVE

# AOF rewrite
redis-cli BGREWRITEAOF

# Copy RDB/AOF files from DATA directory
cp /var/lib/redis/dump.rdb /backup/

# Restore: copy file back and restart
cp /backup/dump.rdb /var/lib/redis/
```

## Best Practices
- Automate backups with cron/K8s CronJob/systemd timers
- Encrypt backup files (GPG, KMS, S3 server-side encryption)
- Store backups in different region/cloud from primary
- Test restore regularly (at least quarterly)
- Monitor backup success/failure with alerts
- Retain multiple backup generations
- Use checksums to verify backup integrity
- Document restore procedures (runbooks)
- Use transaction log shipping for PITR capability
- Implement backup traffic isolation (replica node for backup)
