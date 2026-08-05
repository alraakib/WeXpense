# MLOps and Model Serving

## Model Serving

- **OpenAI-compatible APIs**: Standard `POST /v1/chat/completions` interface; enables drop-in replacement across providers
- **vLLM**: High-throughput serving with PagedAttention; `--port 8000 --model meta-llama/Llama-3.3-70B`
  - Continuous batching, tensor parallel across GPUs, prefix caching, FP8 quantization
- **TGI (Text Generation Inference)** : Hugging Face's Rust/Python server; `text-generation-launcher`
  - Speculative decoding, watermarking, message streaming, LoRA adapter hot-swap
- **BentoML**: Python-first serving framework; `@bentoml.service` decorator wraps model in REST/gRPC endpoint
  - Built-in metrics (Prometheus), adaptive batching, multi-model graphs
- **Ollama**: Easiest local setup; `ollama run llama3.3`; Docker-based GPU pass-through

## LoRA Fine-Tuning

- **PEFT (Parameter-Efficient Fine-Tuning)** : Only train adapter weights (1–2% of full parameters)
- **QLoRA**: 4-bit NormalFloat quantization + LoRA; fine-tune 70B on single 48GB GPU via `bitsandbytes`
  - `model = AutoModelForCausalLM.from_pretrained(..., load_in_4bit=True, bnb_4bit_use_double_quant=True)`
- **Unsloth**: Optimized PEFT kernel; 2x faster training, 50% less memory vs vanilla PEFT
  - Supports Llama, Mistral, Gemma, Qwen, DeepSeek architectures
- **Training loop**: Hugging Face `Trainer` or `SFTTrainer` (trl); AdamW 8-bit; gradient checkpointing; packing
- **Adapter merging**: `model = model.merge_and_unload()` loads LoRA weights into base model for deployment
- **Dataset format**: Chat template `{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}`

## Evaluation Frameworks

- **LangSmith**: Trace LLM calls, run datasets, compare eval runs; `langsmith` Python SDK
  - Custom evaluators (correctness, toxicity, tone); dataset versioning; regression dashboards
- **Weights & Biases**: `wandb` logging; log metrics, model checkpoints, token usage, dataset samples
  - Sweeps for hyperparameter search; artifact store for model versioning
- **MLflow**: Open-source; `mlflow.models.log_model()` + `mlflow.evaluate()` for auto-evaluation
  - Model registry with staging → production promotion; experiment tracking UI
- **Key metrics**: Accuracy, F1, BLEU, ROUGE, perplexity, faithfulness, answer relevancy

## A/B Testing Models

- **Traffic splitting**: `model_a: 50%, model_b: 50%` at router layer; consistent hashing by user_id for session stickiness
- **Metrics comparison**: Compare latency (p50/p95/p99), token output length, user feedback (thumbs up/down)
- **Statistical significance**: Minimum 1,000 samples per variant; Chi-square or Bayesian A/B test
- **Gradual rollout**: 1% → 5% → 25% → 50% → 100% with automated rollback on metric degradation
- **Shadow mode**: Route traffic to new model async without showing user; compare outputs offline

## Guardrails

- **Content filtering**: Regex + ML classifiers for PII, toxicity, jailbreak attempts (`llama-guard3`, `NeMo Guardrails`)
- **Prompt injection detection**: Classify separator injection, role-play attempts, system prompt leakage
  - `lakera-guard` API or local `jailbreak-classifier`
- **Output validation**: Check output against schema (Pydantic, Zod); reject hallucinated entity names, malformed JSON
- **Topic fencing**: Classifier determines if query is in-bounds; out-of-bounds → canned refusal response
- **Rate limiting per user**: Token bucket per user_id; prevent abuse and cost spikes

## Prompt Management

- **Versioning**: Git-based prompt storage; each prompt is a file with schema (system prompt, template, temperature, model)
- **Testing**: Prompt test suite with known inputs and expected outputs; CI compares new prompt version against baseline
- **Registry**: Centralized prompt registry (LangSmith Hub, custom API); deployed prompts are read-only, snapshotted
- **Variables**: `{context}`, `{user_input}`, `{tone}` interpolated at request time; validated at registration

## Observability

- **Token usage**: Track input_tokens, output_tokens per user, per model, per endpoint; alert on cost spikes
- **Latency**: P50/P95/P99 time-to-first-token, total response time; flag models above 3s P95
- **Quality metrics**: Run eval set daily; track drift in accuracy, hallucination rate, refusal rate
- **Logging**: `logfire` (Pydantic), `langfuse`, `helicone` for LLM observability; capture prompts, completions, latency, errors
- **Dashboards**: Grafana + Prometheus (self-hosted), Datadog (managed); visualize token throughput, error rates, cache hit ratio

## AI Safety Best Practices

- **Red teaming**: Systematic adversarial testing by internal team; automated red team with LLM-based attack generator
- **Bias evaluation**: Run fairness benchmarks across demographic groups; log disparity in refusal/toxicity rates
- **Model cards**: Document intended use, limitations, ethical considerations, evaluation results for every deployed model
- **Human-in-the-loop**: High-stakes decisions (medical, financial, legal) require human review before action
- **Data privacy**: Never log full prompt/response pairs with PII; anonymize before persistence; comply with data retention policy
