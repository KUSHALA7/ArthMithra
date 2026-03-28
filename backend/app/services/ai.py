from openai import OpenAI
from backend.app.config import settings
from typing import Optional

# Lazy initialization - client created only when needed
_client: Optional[OpenAI] = None
MODEL = "gpt-4o"  # Using GPT-4 Optimized (latest)

def get_client() -> OpenAI:
    """Get or create OpenAI client."""
    global _client
    if _client is None:
        api_key = settings.openai_api_key
        if not api_key or api_key == "your-openai-key-here":
            raise ValueError("OpenAI API key not configured. Add OPENAI_API_KEY to backend/.env")
        _client = OpenAI(api_key=api_key)
    return _client

async def ask_ai(system_prompt: str, user_message: str, max_tokens: int = 1000) -> str:
    """Single-turn AI call — used for all analysis endpoints."""
    client = get_client()
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )
    return response.choices[0].message.content

async def ask_ai_chat(system_prompt: str, history: list[dict], max_tokens: int = 1000) -> str:
    """Multi-turn chat — preserves conversation history."""
    client = get_client()
    # Prepend system message to history
    messages = [{"role": "system", "content": system_prompt}] + history

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=messages
    )
    return response.choices[0].message.content
