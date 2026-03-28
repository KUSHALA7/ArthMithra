from openai import OpenAI
from backend.app.config import settings

client = OpenAI(api_key=settings.openai_api_key)
MODEL = "gpt-4o"  # Using GPT-4 Optimized (latest)

async def ask_claude(system_prompt: str, user_message: str, max_tokens: int = 1000) -> str:
    """Single-turn GPT call — used for all analysis endpoints."""
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )
    return response.choices[0].message.content

async def ask_claude_chat(system_prompt: str, history: list[dict], max_tokens: int = 1000) -> str:
    """Multi-turn chat — preserves conversation history."""
    # Prepend system message to history
    messages = [{"role": "system", "content": system_prompt}] + history

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=messages
    )
    return response.choices[0].message.content
