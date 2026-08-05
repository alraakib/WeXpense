# Helm Reference

## Core Concepts
- **Chart**: Package of pre-configured K8s resources
- **Release**: A deployed instance of a chart
- **Repository**: Chart storage location
- **Values**: Configuration values for chart templates
- **Templates**: Go-templated K8s manifest files

## Chart Structure
```
mychart/
├── Chart.yaml          # Metadata (name, version, dependencies)
├── values.yaml          # Default configuration values
├── values.schema.json  # JSON Schema for values validation
├── charts/             # Sub-chart dependencies
├── crds/               # Custom Resource Definitions
├── templates/
│   ├── _helpers.tpl    # Template helpers and named templates
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── serviceaccount.yaml
│   ├── _tests/
│   │   └── test-connection.yaml
│   └── NOTES.txt       # Post-install usage instructions
└── Chart.lock          # Dependency lock file (Helm 3+)
```

## Key Commands
- `helm create <name>` — Scaffold new chart
- `helm install <release> <chart>` — Install chart
- `helm upgrade <release> <chart>` — Upgrade release
- `helm rollback <release> <revision>` — Rollback release
- `helm list` — List releases
- `helm uninstall <release>` — Delete release
- `helm repo add <name> <url>` — Add repository
- `helm dependency update` — Update chart dependencies
- `helm template <release> <chart>` — Render templates locally
- `helm get values <release>` — Get release values
- `helm get manifest <release>` — Get rendered manifests

## Best Practices
- Follow chart best practices guide
- Use `values.schema.json` for validation
- Use `_helpers.tpl` for reusable named templates
- Pin dependencies with `` in Chart.yaml
- Use `helm lint` for chart validation
- Use `--atomic` with `--timeout` for upgrades
- Use `--wait` for deployment completion
- Separate environment values into files (values-dev.yaml, values-prod.yaml)
- Use OCI registries for chart distribution
- Test charts with `helm test`
- Use Chart Testing (`ct`) for CI validation

## Template Functions
- `.Values.*` — Access values
- `.Release.*` — Release metadata (Name, Namespace, Service)
- `.Chart.*` — Chart metadata
- `.Files.Get` — Include file content
- `include` — Reuse named templates
- `required` — Fail if value missing
- `default` — Provide default value
- `toYaml` — Format as YAML
- `tpl` — Evaluate string as template

## Helmfile
Declarative Helm management:
```yaml
repositories:
  - name: bitnami
    url: https://charts.bitnami.com/bitnami

releases:
  - name: myapp
    namespace: production
    chart: ./charts/myapp
    values:
      - values/prod.yaml
    set:
      - name: image.tag
        value: "{{ .Environment.Values.image_tag }}"
```
