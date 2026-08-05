# Kubernetes Reference

## Architecture
- **Control Plane**: kube-apiserver, etcd, kube-scheduler, kube-controller-manager, cloud-controller-manager
- **Worker Nodes**: kubelet, kube-proxy, container runtime (containerd, CRI-O)
- **Networking**: CNI plugins (Calico, Cilium, Flannel, Weave)

## Core Objects
- **Pod**: Smallest deployable unit, one or more containers
- **Deployment**: Declarative updates for Pods and ReplicaSets
- **Service**: Stable network endpoint for Pods (ClusterIP, NodePort, LoadBalancer)
- **Ingress**: HTTP/S routing with rules and TLS termination
- **ConfigMap / Secret**: Environment configuration and sensitive data
- **PersistentVolume / PersistentVolumeClaim**: Storage lifecycle management
- **Namespace**: Virtual cluster partitioning
- **StatefulSet**: Stateful applications with stable network identity
- **DaemonSet**: Runs one Pod per node
- **Job / CronJob**: Batch processing and scheduled tasks
- **NetworkPolicy**: Ingress/egress traffic rules at Pod level
- **Role / RoleBinding / ClusterRole / ClusterRoleBinding**: RBAC

## Key Commands
- `kubectl get <resource>` — List resources
- `kubectl describe <resource> <name>` — Detailed info
- `kubectl logs -f <pod>` — Stream logs
- `kubectl exec -it <pod> -- <cmd>` — Execute in pod
- `kubectl port-forward <pod> 8080:80` — Forward port
- `kubectl apply -f <file.yaml>` — Create/update resources
- `kubectl delete <resource> <name>` — Delete resource
- `kubectl rollout status deployment/<name>` — Check rollout
- `kubectl rollout undo deployment/<name>` — Rollback
- `kubectl top pod/node` — Resource usage
- `kubectl get events --sort-by='.lastTimestamp'` — View events

## Best Practices
- Use namespaces for environment isolation
- Set resource requests/limits on all containers
- Use liveness, readiness, and startup probes
- Use `HorizontalPodAutoscaler` for automatic scaling
- Use `PodDisruptionBudget` for availability
- Use `NetworkPolicy` for zero-trust networking
- Use RBAC with least-privilege principle
- Enable audit logging on API server
- Use `Secrets` (not ConfigMaps) for sensitive data
- Encrypt secrets at rest with KMS
- Use taints/tolerations and node affinity for workload placement
- Use Topology Spread Constraints for HA
- Use `PriorityClass` for critical workloads
- Implement pod security standards (baseline/restricted)

## Production Cluster Considerations
- Use managed K8s (EKS, GKE, AKS) when possible
- etcd backup strategy (snapshots + disaster recovery)
- Regularly update cluster version
- Use cluster autoscaler for node scaling
- Enable cloud provider integration (load balancers, storage)
- Use service mesh (Istio, Linkerd) for mTLS and observability
- Implement GitOps (ArgoCD, Flux) for deployment management
