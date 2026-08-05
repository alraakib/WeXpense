# Data Engineering Core Concepts

## Pipeline Patterns
- **Batch ETL**: Extract → Transform → Load (periodic, high latency)
- **Batch ELT**: Extract → Load → Transform (dbt, modern data stack)
- **Streaming**: Real-time ingestion and processing (Kafka, Flink)
- **CDC**: Change Data Capture from operational databases (Debezium)

## Data Modeling
- **Kimball Star Schema**: Fact tables (measures) + Dimension tables (attributes)
- **Inmon 3NF**: Normalized enterprise data warehouse
- **Data Vault**: Hubs (business keys), Links (relationships), Satellites (attributes)
- **Medallion**: Bronze (raw) → Silver (validated) → Gold (aggregated)

## Key Tools
| Category | Tools |
|----------|-------|
| Orchestration | Airflow, Dagster, Prefect |
| Transformation | dbt, Spark, SQL |
| Streaming | Kafka, Flink, Pulsar, Kafka Streams |
| Storage | S3, GCS, ADLS, Delta Lake, Iceberg |
| Warehousing | Snowflake, BigQuery, Redshift, ClickHouse |
| Quality | Great Expectations, dbt tests, Soda |
| BI | Looker, Metabase, Superset, Tableau |

## Partitioning Strategy
- Partition by date for time-series data
- Use proper cardinality (daily/monthly, not hourly for small tables)
- Combine with clustering for dimensions (customer_id, region)
- Implement retention policies: hot/warm/cold tiers

## dbt Conventions
```sql
-- Model config
{{ config(materialized='incremental', unique_key='order_id',
    partition_by={'field': 'order_date', 'data_type': 'date'}) }}
```
