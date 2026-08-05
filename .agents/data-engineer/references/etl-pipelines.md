# ETL/ELT Pipeline Patterns

## dbt — Core Concepts
- **Models**: SQL files in `models/`, compiled to `CREATE TABLE/VIEW AS`
- **Materializations**: `table`, `view`, `incremental`, `ephemeral`, `materialized_view`
- **Tests**: `unique`, `not_null`, `accepted_values`, `relationships`, custom `generic` tests
- **Sources**: `{{ source('schema', 'table') }}` — upstream dependencies defined in YAML
- **Refs**: `{{ ref('model_name') }}` — lineage-aware references between models
- **Snapshots**: Type-2 slowly changing dimensions via `{% snapshot %}`
- **Docs**: `dbt docs generate` → `dbt docs serve` — auto-generated docs + lineage graph
- **Seeds**: CSV files in `seeds/`, loaded via `dbt seed`
- **Exposures**: Define downstream Dashboards/Analysis in YAML for lineage visibility

```yaml
# schema.yml
version: 2

sources:
  - name: raw
    database: analytics
    tables:
      - name: orders
        loaded_at_field: created_at
        freshness:
          warn_after: { count: 6, period: hour }
          error_after: { count: 24, period: hour }

models:
  - name: order_summary
    description: "Daily order aggregations"
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: total_revenue
        tests:
          - dbt_utils.accepted_range:
              min_value: 0
```

## ELT vs ETL
- **ETL**: Transform before load — good for legacy warehouses, sensitive data masking, limited compute
- **ELT**: Load raw data first, transform in-warehouse — leverages modern MPP compute (Snowflake/BigQuery/Redshift)
- **Modern stack**: ELT + dbt + Snowflake/BigQuery + Airflow — decoupled, scalable
- **Hybrid**: Raw ingestion ELT, then ETL-like staging if warehouse has transform restrictions

```sql
-- dbt incremental model with unique key + timestamp filtering
{{ config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge'
) }}

SELECT
    order_id,
    customer_id,
    amount,
    status,
    created_at
FROM {{ source('raw', 'orders') }}
{% if is_incremental() %}
    WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})
{% endif %}
```

---

## Apache Airflow

### DAG Structure
```python
from airflow import DAG
from airflow.decorators import dag, task
from datetime import datetime

@dag(
    schedule="@daily",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args={"retries": 3, "retry_delay": timedelta(minutes=5)},
    tags=["analytics"],
)
def analytics_pipeline():
    @task
    def extract():
        ...

    @task
    def load_raw():
        ...

    @task
    def run_dbt():
        ...

    @task
    def refresh_dashboards():
        ...

    extract() >> load_raw() >> run_dbt() >> refresh_dashboards()

analytics_pipeline()
```

### Operators & Sensors
- **`BashOperator`**: Execute shell commands (dbt run, spark-submit)
- **`PythonOperator`**: Execute Python callables
- **`PostgresOperator` / `SnowflakeOperator` / `BigQueryInsertJobOperator`**: DB-specific
- **`KubernetesPodOperator`**: Run containers in K8s cluster
- **`ExternalTaskSensor`**: Wait for another DAG to complete
- **`TimeSensor`**: Pause until specific time
- **`FileSensor`**: Wait for file to appear in storage
- **`S3KeySensor` / `GCSObjectExistenceSensor`**: Cloud storage triggers

### TaskFlow API
- `@dag`, `@task` decorators with automatic dependency inference
- XComs passed implicitly via function return values
- `expand()` for dynamic task mapping (fan-out)
- `with DAG(...)` context manager (classic) vs `@dag` (TaskFlow)

```python
@task
def fetch_orders(ds: str) -> list[dict]:
    return api.get_orders(date=ds)

@task
def transform_order(order: dict) -> dict:
    order["revenue_usd"] = order["amount"] * order.get("fx_rate", 1)
    return order

@task
def load(transformed: list[dict]):
    db.insert_many(transformed)

@dag(...)
def pipeline():
    orders = fetch_orders()
    transformed = transform_order.expand(order=orders)
    load(transformed)
```

---

## Incremental Loading Strategies
- **Timestamp-based**: `WHERE updated_at > last_max_updated_at` — simple, misses deletes
- **ID-based**: `WHERE id > last_max_id` — append-only, no updates/deletes
- **Full refresh**: Truncate and reload — for small dimension tables
- **Merge/Upsert**: `MERGE INTO` (Snowflake/DuckDB) or `INSERT ON CONFLICT DO UPDATE` (Postgres)
- **CDC**: Debezium Kafka connector → stream of insert/update/delete events
- **Delete+insert**: DELETE range then INSERT latest — handles deletes cleanly
- **Snapshot**: `dbt snapshot` with `check_cols` or `updated_at` for type-2 SCD

### Freshness Thresholds
| Data Tier | Acceptable Delay | Action |
|-----------|-----------------|--------|
| Real-time dashboards | < 5 min | Streaming pipeline |
| Daily reports | < 2 hours | Batch with SLA alert |
| Weekly summaries | < 24 hours | Batch, lower priority |
| ML feature tables | < 1 hour | Feature store pipeline |

## Orchestration Best Practices
- **Idempotency**: Every DAG run produces identical results for same inputs
- **Backfill**: Use `catchup=True` or trigger individual DAG runs for historical dates
- **Retry with backoff**: Exponential backoff for transient failures (API rate limits, network)
- **Alerting**: PagerDuty/Slack on `failed`, `sla_miss`; daily digest for success
- **SLAs**: Define max acceptable DAG duration, alert if exceeded
- **Testing**: `dag.test()` for local validation; `unittest.TestCase` for custom operators
- **Version control**: DAG files in Git, deployed via CI/CD (scheduler sync or image rebuild)
- **Resource pooling**: Celery/Kubernetes executors, concurrency limits, pool slots
- **Isolation**: Separate DAGs for prod/staging, use different connections and variable prefixes
- **Cleanup**: Log retention (S3/GCS lifecycle), deleted old task instances

---

## Jinja Templating in dbt
- `{{ source('schema', 'table') }}` — reference source tables
- `{{ ref('model_name') }}` — reference downstream models
- `{{ config(key='value') }}` — model-level configuration
- `{{ is_incremental() }}` — conditionally filter during incremental runs
- `{{ this }}` — current model's table name
- `{{ var('my_variable') }}` — access dbt_project.yml variables
- `{{ dbt_utils.generate_surrogate_key(['col1', 'col2']) }}` — surrogate keys
- `{% for day in ['2024-01-01', '2024-01-02'] %} UNION ALL {% endfor %}` — loop over dates
- `{{ adapter.quote('column_name') }}` — dialect-aware quoting

```sql
/* Custom macro example: date spine */
{% macro date_spine(start_date, end_date) %}
    WITH date_spine AS (
        SELECT date_day
        FROM UNNEST(GENERATE_DATE_ARRAY(
            DATE('{{ start_date }}'),
            DATE('{{ end_date }}')
        )) AS date_day
    )
    SELECT * FROM date_spine
{% endmacro %}
```

## dbt Project Structure
```
my_dbt_project/
├── models/
│   ├── staging/          # Raw → cleaned (source mapping, type casting)
│   ├── intermediate/     # Business logic joins, aggregations
│   └── marts/            # Final business-ready tables
│       ├── finance/
│       ├── marketing/
│       └── product/
├── tests/                # Custom singular tests
├── macros/               # Reusable Jinja snippets
├── seeds/                # Reference CSV files
├── snapshots/            # SCD Type-2 tracking
├── analyses/             # Ad-hoc SQL (not materialized)
├── docs/                 # Custom doc blocks
├── dbt_project.yml       # Project config
├── profiles.yml          # Warehouse connection config
├── packages.yml          # dbt package dependencies
└── .dbt/                 # Local artifacts (manifest, run_results)
```
