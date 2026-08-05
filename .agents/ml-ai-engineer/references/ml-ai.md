# ML/AI Engineering Reference

## LLM Providers
| Provider | Model | Strengths | Best For |
|----------|-------|-----------|----------|
| OpenAI | GPT-4o, GPT-4o-mini | Broad capability, tool use | General-purpose, agents |
| Anthropic | Claude Sonnet 4, Opus 4 | Long context, safety, code | Complex reasoning, coding |
| Google | Gemini 2.5 Pro | Long context, multimodal | Video/audio processing |
| Open source | Llama 3, Mistral, Qwen | Self-hosted, no API costs | Private data, fine-tuning |

## RAG Pipeline
1. Document ingestion → chunking → embedding → vector store
2. Query → embed → vector search → re-rank → LLM with context → response
3. Chunk: 512-1024 tokens with 10-20% overlap
4. Embed: text-embedding-3-small (1536d) or ada-002 / voyage-2
5. Search: hybrid (vector + keyword) with metadata filtering
6. Re-rank: Cohere Rerank, BGE Reranker, or cross-encoder

## Vector Databases
| DB | Hosting | Features |
|----|---------|----------|
| pgvector | Self or managed | Integrated with PostgreSQL |
| Pinecone | Managed only | Serverless, high-scale |
| Chroma | Embedded | Simplicity, local dev |
| Weaviate | Self or cloud | Hybrid search |
| Qdrant | Self or cloud | High perf, filtering |

## Prompt Engineering
- System prompt: role + task + guidelines + context + format
- Few-shot: examples in prompt
- Chain-of-thought: step-by-step reasoning
- Structured output: JSON mode, tool calling, constrained generation
- System prompt injection prevention: strict separation, input sanitization

## AI Agents
- LangChain/LangGraph: Python/TS agent framework with tools, memory, state
- Vercel AI SDK: TypeScript-first, streaming, React hooks
- CrewAI: Multi-agent orchestration
- AutoGen: Microsoft's multi-agent framework

## MLOps
- Model serving: BentoML, TensorFlow Serving, vLLM, TGI
- Monitoring: token usage, latency, cost, quality drift
- Evaluation: LLM-as-judge, BLEU, ROUGE, semantic similarity
- Caching: semantically cached responses (similar queries get cached answer)
- Guardrails: content filtering, PII detection, rate limiting, cost controls
