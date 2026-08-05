# LLM API Integration

## OpenAI API

- **Chat Completions**: `POST /v1/chat/completions`; messages array with `system`, `user`, `assistant`, `tool` roles
- **Structured output**: `response_format: { type: "json_object" }` or `response_format: { type: "json_schema", json_schema: {...} }`
- **Function calling**: Tools array with `type: "function"`, `function.name`, `function.parameters` (JSON Schema); model emits `tool_calls`
- **Assistants API**: Thread-based persistent state; `run` lifecycle (queued → in_progress → requires_action → completed → failed)
- **Streaming**: `stream: true` returns SSE deltas via `data: {"choices":[{"delta":{...}}]}`
- **Models**: `gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `o3`, `o4-mini`

## Anthropic API

- **Messages API**: `POST /v1/messages`; system prompt is top-level param, not a message role
- **Tool use**: `tools` array with `name`, `description`, `input_schema`; model emits `tool_use` content blocks
- **Extended thinking**: `thinking: { type: "enabled", budget_tokens: 16000 }`; model returns separate `thinking` and `text` blocks
- **Streaming**: SSE with `content_block_delta`, `content_block_stop`, `message_delta` events
- **Prompt caching**: `{"type": "ephemeral"}` cache control; breakpoints on system messages and tools; 5-min TTL at 50% token discount
- **Models**: `claude-sonnet-4-20250514`, `claude-4-20250514`, `claude-3-5-haiku-latest`

## Google Gemini API

- **Content generation**: `POST /v1/models/gemini-2.0-flash:generateContent`; `contents` array with `parts`
- **Safety settings**: Per-category thresholds (`HARM_CATEGORY_HARASSMENT`, `HARM_CATEGORY_HATE_SPEECH`); `BLOCK_ONLY_HIGH` or `BLOCK_NONE`
- **Grounding**: `googleSearch` or `vertexSearch` grounding sources; returns citation footnotes
- **System instruction**: Top-level `systemInstruction` param with `parts` array
- **Context caching**: Cache contents for repeated system prompts or large context docs
- **Models**: `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-2.5-pro`

## OpenRouter

- **Unified API**: OpenAI-compatible endpoint `POST /v1/chat/completions`; routes to dozens of providers
- **Fallback chains**: `route: "fallback"` with ordered model list; retries next on 5xx or rate limits
- **Multi-model routing**: `route: "multi"` sends same request to N models, returns first complete
- **Cost tracking**: `X-Request-Costs` header includes per-call spend in USD

## Local Models

- **ollama**: `POST /api/chat`; pull models (`ollama pull llama3.3:70b`); compatible with OpenAI client via `baseURL`
- **vLLM**: OpenAI-compatible server; `python -m vLLM.entrypoints.openai.api_server --model meta-llama/Llama-3.3-70B`
- **llama.cpp**: `server` binary with GPT-4-compatible endpoint; GGUF quantized models
- **Considerations**: GPU memory, quantization (Q4_K_M, Q8_0), context window limits, batching throughput

## Token Management

- **Counting**: `tiktoken` for OpenAI models; `claude-tokenizer` or `anthropic-tokenizer` for Claude
- **Windowing**: Sliding-window context (truncate oldest turns); `max_tokens` response cap prevents overflow
- **Cost estimation**: `cost = input_tokens * rate_in + output_tokens * rate_out`
- **Token budgets**: Reserve 25% of context window for system prompt + tools; 75% for conversation history

## Streaming Responses

- **SSE format**: `data: {...}` messages; `[DONE]` sentinel signals stream end
- **Client config**: `ReadableStream` in browser, `EventSource` in Node, `asyncio` SSE in Python
- **Abort patterns**: `AbortController` / `CancellationToken` cancels mid-stream to save costs
- **Chunk parsing**: Handle partial JSON fragments; aggregate `choice.delta.content` incrementally

## Retry and Fallback

- **Exponential backoff**: Initial 1s, max 32s, jitter (+/- 50%), max 5 retries
- **Retry on**: 429 (rate limit), 500, 502, 503; do NOT retry on 400 or 401
- **Provider fallback**: Try primary → secondary → fallback on connection errors
- **Circuit breaker**: Stop retries after N consecutive failures within a time window

## Rate Limiting

- **OpenAI tiers**: RPM (requests/min) + TPM (tokens/min); Tier 5 = 10,000 RPM, 2,000,000 TPM
- **Concurrency**: Token bucket or leaky bucket algorithm; `asyncio.Semaphore` (Python) or `p-limit` (JS)
- **Queue**: Bounded priority queue; high-priority requests bypass rate checking for real-time features

## Response Validation

- **JSON mode**: `response_format: { type: "json_object" }` forces valid JSON; validate with `JSON.parse()` + Zod/Joi schema
- **Structured output schema**: OpenAI supplies `json_schema` param; guarantees field types and required fields
- **Function call validation**: Verify `tool_call.arguments` matches expected JSON Schema; reject malformed calls
- **Fallback**: If model output fails validation, request again with schema in the system prompt
