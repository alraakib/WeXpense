# Data Warehousing and Lakehouse

## Dimensional Modeling (Kimball)

### Fact Tables
- **Transaction facts**: One row per event (sales order, click, page view)
- **Periodic snapshot facts**: One row per period (daily account balance)
- **Accumulating snapshot facts**: One row per pipeline (order fulfillment lifecycle)
- **Factless facts**: Events with no measures (attendance, registration)
- **Additive measures**: Summable across all dimensions (revenue, quantity)
- **Semi-additive**: Summable across some dimensions (account balance across time)
- **Non-additive**: Ratios, percentages, averages (store pre-aggregated)

```sql
-- Transaction fact table
CREATE TABLE fact_sales (
    sales_pk BIGINT IDENTITY,
    customer_sk INT NOT NULL REFERENCES dim_customer(customer_sk),
    product_sk INT NOT NULL REFERENCES dim_product(product_sk),
    date_sk INT NOT NULL REFERENCES dim_date(date_sk),
    store_sk INT NOT NULL REFERENCES dim_store(store_sk),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (sales_pk)
) PARTITION BY RANGE (date_sk);
```

### Dimension Tables
- **Conformed dimensions**: Shareable across facts (customer, date, product)
- **Slowly Changing Dimensions (SCD)**:
  - Type 0: Retain original (immutable attributes)
  - Type 1: Overwrite (no history)
  - Type 2: Add new row with `valid_from`/`valid_to`/`current_flag` (full history)
  - Type 3: Add alternate columns (`original_region`, `current_region`)
  - Type 6: Hybrid Type 2 + Type 3
- **Degenerate dimensions**: Fact-only attributes (order number, invoice ID)
- **Junk dimensions**: Low-cardinality flags and indicators combined into one table
- **Role-playing dimensions**: Same dimension table used with different aliases (order_date, ship_date)

```sql
-- Type-2 SCD dimension
CREATE TABLE dim_customer (
    customer_sk INT IDENTITY PRIMARY KEY,
    customer_id INT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    segment VARCHAR(50) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    current_flag BOOLEAN DEFAULT TRUE,
    UNIQUE (customer_id, valid_from)
);
```

### Date Dimension
```sql
CREATE TABLE dim_date (
    date_sk INT PRIMARY KEY,
    date DATE NOT NULL,
    year INT NOT NULL,
    quarter INT NOT NULL,
    month INT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    day INT NOT NULL,
    day_of_week INT NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    week_start_date DATE NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE
);
```

---

## Data Vault 2.0
- **Hubs**: Business keys (natural keys), hard rules — `customer_id`, `order_id`, `product_id`
- **Links**: Relationships between hubs (many-to-many) — `customer_order_link`
- **Satellites**: Descriptive attributes, context, soft rules — `customer_sat`, `order_sat`
- **Hub structure**: `hk_<hub>` hash key (SHA-256), `business_key`, `load_timestamp`, `record_source`
- **Link structure**: `hk_<hub1>_<hub2>` hash key, `hk_<hub1>` FK, `hk_<hub2>` FK, `load_timestamp`, `record_source`
- **Satellite structure**: `hk_<parent>` FK, `load_timestamp`, `hash_diff` (CHKSUM), attributes, `record_source`
- **Raw Data Vault**: Direct from sources, no business logic
- **Business Data Vault**: Business rules, derived data on top of Raw DV

```sql
CREATE TABLE hub_customer (
    hk_customer BINARY(32) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL UNIQUE,
    load_ts TIMESTAMP NOT NULL,
    record_source VARCHAR(100) NOT NULL
);

CREATE TABLE sat_customer_details (
    hk_customer BINARY(32) REFERENCES hub_customer(hk_customer),
    load_ts TIMESTAMP NOT NULL,
    hash_diff BINARY(32) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(200),
    segment VARCHAR(50),
    record_source VARCHAR(100),
    PRIMARY KEY (hk_customer, load_ts)
);
```

## Data Lakehouse

### Delta Lake
- ACID transactions on Parquet via transaction log (`_delta_log/`)
- Time travel: `SELECT * FROM table VERSION AS OF <version>` or `TIMESTAMP AS OF <timestamp>`
- Schema enforcement + schema evolution (`.mergeSchema()`)
- `OPTIMIZE` for file compaction, `ZORDER BY` for co-location
- `VACUUM` to remove old files beyond retention threshold

```sql
-- Delta Lake operations (Spark SQL)
OPTIMIZE orders ZORDER BY (customer_id, order_date);

-- Time travel
SELECT * FROM orders VERSION AS OF 42;
SELECT * FROM orders TIMESTAMP AS OF '2024-01-15 10:00:00';

--- Merge (upsert)
MERGE INTO target t
USING source s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

### Apache Iceberg
- Open table format, table metadata in catalog (Hive, Nessie, Glue, JDBC)
- **Manifest files**: List of data files with column stats (min/max/count)
- **Partition evolution**: Change partition spec without rewriting data
- **Hidden partitioning**: Queries use predicates automatically
- **`MERGE INTO`**, `UPDATE`, `DELETE` support
- **Optimization**: `REWRITE DATA` (compaction), `REWRITE MANIFESTS`, `EXPIRING SNAPSHOTS`
- **Trino / Spark / Flink** all read Iceberg natively

### Apache Hudi
- **Copy-on-Write (COW)**: Parquet only, rewrite on upsert — good for read-heavy
- **Merge-on-Read (MOR)**: Parquet base + Avro log — good for write-heavy
- `write.operation=upsert`, `insert`, `bulk_insert`, `delete`
- Incremental queries via `hoodie.<table>.consume.commit`
- Clustering: `run_clustering` with sorting columns
- Indexing: Bloom filter, HBase, simple, bucketed

---

## Storage (S3 / ADLS / GCS)
- Object storage as data lake: unlimited scale, cheap, separate compute
- **Folder structure**: `s3://lake/db/table/partition_col=value/file.parquet`
- **Lifecycle rules**: Standard → Infrequent Access → Glacier after N days
- **Consistency**: S3 is read-after-write for new objects (eventual for overwrites)
- **Performance**: Prefix parallelization (S3: 3,500 PUT/5,500 GET per prefix)
- **Hive-style partitioning**: `year=2024/month=01/day=15/` (compatible with Athena/Spark/Trino)
- **File slicing**: Target 128MB–1GB per file after compression

## Partitioning and Clustering
- **Partition by**: Date column for time-based data, high-cardinality keys
- **Avoid over-partitioning**: Small partitions = too many small files (= slow list operations)
- **Recommended partition size**: 100MB–1GB compressed
- **Clustering**: Within-partition sort order — `ZORDER` (Delta), `CLUSTER BY` (Snowflake), `SORT KEY` (Redshift)
- **Clustering columns**: High-cardinality filter columns (customer_id, product_id)
- **Iceberg sorting**: `SORT BY customer_id WITH RANGE 500MB` — optimizes merge joins

| Partition Granularity | Data Volume | Example |
|----------------------|-------------|---------|
| Daily | > 100GB/day | events, clicks, logs |
| Monthly | 10GB–100GB/month | orders, transactions |
| Yearly | < 1TB/year | financial aggregations |
| No partition | < 50GB | dimension tables |

## Columnar Storage (Parquet / ORC)
- **Parquet**: Default for Spark, Presto, Trino, Athena — column projection, predicate pushdown
- **ORC**: Default for Hive — better compression, lightweight indexes (min/max per stripe)
- **Row group size**: 128MB default, tune based on column count
- **Compression**: Snappy (fast) or ZSTD (better ratio) for Parquet; ZLIB for ORC
- **Bloom filters**: Column-level skip on lookups (Parquet `column_index`, ORC bloom filter)
- **Statistics**: Per-column min/max/null-count in metadata for query pruning

---

## Lakehouse Architectures

### Databricks (Delta Lake)
- Unity Catalog: Centralized metastore, RBAC, lineage
- Serverless SQL warehouses: Instant compute, auto-scaling
- Delta Sharing: Open protocol for cross-org data sharing
- Delta Live Tables (DLT): Declarative pipeline with expectations

### Snowflake
- Cloud-agnostic (AWS/Azure/GCP), multi-cluster virtual warehouses
- **Data sharing**: Read-only sharing across accounts (no copy)
- **Time travel**: 1–90 days, `CLONE` for zero-copy branching
- **Snowpipe**: Auto-ingest from S3/GCS/Azure Blob (event-driven)
- **Dynamic tables**: Declarative incremental refresh (materialized-like)
- **Streams + Tasks**: CDC capture + scheduled transformation
- **Search optimization service**: Accelerates selective point lookups
- **Data marketplace**: Buy/share third-party datasets

### Query Engines
- **Trino**: Distributed SQL engine, federated queries across sources (no storage)
- **Athena**: Serverless Presto-based, pay-per-query, Glue Data Catalog
- **Presto**: Originated at Facebook, cost-based optimizer, connector architecture
- **ClickHouse**: Real-time OLAP, columnar, MPP, sub-second queries on billions of rows
- **DuckDB**: Embedded OLAP, zero-config, ideal for analytics on single node / notebooks

```sql
-- Trino federated query across Postgres + Hive + Iceberg
SELECT
    c.name,
    SUM(o.total) AS lifetime_value
FROM postgresql.analytics.customers c
JOIN iceberg.analytics.orders o ON c.id = o.customer_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '30' DAY
GROUP BY c.name
ORDER BY lifetime_value DESC;
```
