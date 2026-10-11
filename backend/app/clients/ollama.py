import os
import json
from typing import TypedDict
import httpx
import time
from collections.abc import Iterator

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "300"))


class OllamaMessage(TypedDict):
    role: str
    content: str


class OllamaChatResult(TypedDict):
    content: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    execution_time: int


class OllamaClientError(Exception):
    pass


def generate_chat(
    model: str,
    messages: list[OllamaMessage],
) -> OllamaChatResult:
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
    }

    try:
        start_time = time.perf_counter()
        with httpx.Client( base_url=OLLAMA_BASE_URL, timeout=OLLAMA_TIMEOUT_SECONDS ) as client:
            response = client.post("/api/chat", json=payload)

            response.raise_for_status()
            data = response.json()

            message = data.get("message", {})
            content = message.get("content")
        
            if not isinstance(content, str) or not content.strip():
                raise OllamaClientError("Ollama returned an empty response")

            end_time = time.perf_counter()

            return {
                "content": content.strip(),
                "model": data.get("model", model),
                "prompt_tokens": data.get("prompt_eval_count", 0),
                "completion_tokens": data.get("eval_count", 0),
                "execution_time": end_time - start_time
            }

    except httpx.ConnectError as error:
        raise OllamaClientError("Could not connect to Ollama") from error

    except httpx.TimeoutException as error:
        raise OllamaClientError("Ollama request timed out") from error

    except httpx.HTTPStatusError as error:
        raise OllamaClientError(f"Ollama returned status {error.response.status_code}") from error

    except httpx.RequestError as error:
        raise OllamaClientError("Ollama request failed") from error



def stream_chat(
    model: str,
    messages: list[OllamaMessage],
) -> Iterator[dict]:
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    with httpx.stream( "POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload, timeout=OLLAMA_TIMEOUT_SECONDS) as response:
        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue

            chunk = json.loads(line)

            if chunk.get("done"):
                yield {
                    "type": "done",
                    "prompt_tokens": chunk.get("prompt_eval_count", 0),
                    "completion_tokens": chunk.get("eval_count", 0),
                }
                return

            content = chunk.get("message", {}).get("content", "")

            if content:
                yield {
                    "type": "content",
                    "content": content,
                }