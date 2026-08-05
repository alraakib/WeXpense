# RAG and Vector Databases

## RAG Architecture

```
Documents → Chunking → Embedding → Vector DB
                                        ↓
User Query → Embedding → ANN Search → Retrieve Chunks → Prompt Augmentation → LLM
```

- **Ingestion**: Parse documents (PDF, HTML, Markdown, code, plaintext); handle tables, images, code blocks
- **Embedding**: Convert chunks into dense vector representations using embedding model
- **Retrieval**: Approximate nearest neighbor (ANN) search returns top-K chunks
- **Generation**: Augment prompt with retrieved chunks + original query → LLM response

## Chunking Strategies

- **Fixed size**: Split every N characters/tokens with overlap; simple but may cut mid-sentence
- **Semantic**: Split at sentence/paragraph boundaries using NLP (NLTK, spaCy, LangChain text splitters)
- **Recursive**: Multiple delimiters `["\n\n", "\n", ".", " "]` with descending priority; best for mixed content
- **Agentic**: Use LLM to decide chunk boundaries; high quality but slow and expensive
- **Chunk size guidelines**: 256–1024 tokens depending on embedding model context window; 10–20% overlap
- **Boundary awareness**: Code chunks respect function/class boundaries; HTML respects semantic elements

## Embedding Models

- **OpenAI**: `text-embedding-3-small` (1536d, 62.3% MTEB), `text-embedding-3-large` (3072d, 64.6% MTEB)
- **Voyage**: `voyage-3-large` (1024d), `voyage-code-3` (1024d, optimized for code)
- **Cohere**: `embed-english-v3.0` (1024d), `embed-multilingual-v3.0` (1024d)
- **BGE (BAAI)**: `BGE-large-en-v1.5` (1024d, open-source), `BGE-m3` (multilingual + multi-vector)
- **Local**: `sentence-transformers` (all-MiniLM-L6-v2, 384d, fast); `mxbai-embed-large-v1` (1024d)
- **Dimension trade-offs**: Higher dims → more accuracy but more storage; 768–1024d is standard sweet spot

## Vector Databases

- **pgvector**: PostgreSQL extension; 1M+ vectors with IVFFlat or HNSW index; supports hybrid + SQL joins
  - `CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops)`
- **Pinecone**: Managed SaaS; serverless pod-based; automatic scaling; high throughput for production
- **Chroma**: Embedded, file-based; ideal for prototyping; `chromadb.Client()` in Python
- **Weaviate**: Self-hosted or cloud; GraphQL interface; multi-tenancy; hybrid search built-in
- **Qdrant**: Rust-based; gRPC + REST APIs; filters + payload indexing; high performance on benchmarks
- **LanceDB**: Embedded columnar DB; no server needed; built on Lance format; integrates with ML frameworks

## Hybrid Search (Vector + Keyword)

- **BM25**: Sparse retrieval; TF-IDF on steroids; `rank_bm25` library or `tantivy` for Rust
- **Combined scoring**: `final_score = alpha * vector_score + (1 - alpha) * bm25_score`
  - Alpha tuning: 0.5 for balanced, >0.5 for semantic-heavy, <0.5 for keyword-matching-heavy
- **Reciprocal Rank Fusion (RRF)**: `score = 1 / (k + rank)` per method, sum across methods; k=60 standard
- **Dense + Sparse (ColBERT)** : Late-interaction model scores each query token against passage tokens

## Metadata Filtering

- **Pre-filter**: Apply metadata filters before vector search; reduces search space
  - `filter: { "source": { "$eq": "documentation" }, "date": { "$gte": "2025-01-01" } }`
- **Post-filter**: Run vector search then filter; may miss relevant results if filter is too restrictive
- **Indexed fields**: Add indices on frequently filtered metadata columns (category, source, author, date)
- **Effective metadata**: Document source, chunk index, page number, section heading, author, language, date

## Re-ranking

- **Cohere Rerank**: `POST /v1/rerank`; returns relevance scores for query–document pairs; model `rerank-english-v3.0`
- **Cross-encoders**: Local re-ranker (e.g., `cross-encoder/ms-marco-MiniLM-L-6-v2`); slower but more accurate
- **Two-stage pipeline**: Retrieve top-100 with embedding → re-rank to top-10 with cross-encoder
- **Re-ranking cost**: Add 10–20ms per document pair; batch calls to minimize latency

## Prompt Augmentation

- **Template**: `Context:\n{context}\n\nQuestion: {query}\n\nAnswer based on context above.`
- **Context window optimization**: Fit top-K results within available window; trim/resume when overflowing
  - Token count retrieved chunks; truncate lowest-score chunks if exceeding `max_context_tokens`
- **Source citation**: Include source/title metadata per chunk; LLM outputs citations inline
- **Query rewriting**: LLM rewrites user query into search-optimized query before embedding retrieval
- **Hyde (Hypothetical Document Embedding)**: Generate a synthetic passage as if it were the answer, embed that for search
