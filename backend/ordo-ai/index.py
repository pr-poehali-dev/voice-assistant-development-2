"""Ордо ИИ — обработка голосовых команд через GPT-4o"""
import json
import os
import urllib.request
import urllib.error


SYSTEM_PROMPT = """Ты — Ордо, умный голосовой ассистент. Отвечай кратко (1-3 предложения), по-русски, дружелюбно.

Правила:
- Если спрашивают время/дату — скажи что не можешь, предложи спросить голосом
- Если просят открыть сайт — скажи "Не могу открывать сайты, но могу ответить на вопрос"
- На вопросы отвечай по существу, кратко и понятно
- Можешь шутить, быть живым в общении
- Ты работаешь на базе GPT-4o, но твоё имя — Ордо
- Если спрашивают кто ты — "Я Ордо, голосовой ассистент с ИИ"
"""


def handler(event, context):
    """Обработка запросов к ИИ-ассистенту Ордо"""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    cors_headers = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"}

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "response": "ИИ временно недоступен. Ключ API не настроен.",
                "status": "error",
            }),
        }

    try:
        body = json.loads(event.get("body", "{}"))
    except (json.JSONDecodeError, TypeError):
        body = {}

    message = body.get("message", "").strip()
    history = body.get("history", [])

    if not message:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"response": "Пустой запрос", "status": "error"}),
        }

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for item in history[-6:]:
        messages.append({"role": "user", "content": item.get("user", "")})
        messages.append({"role": "assistant", "content": item.get("assistant", "")})

    messages.append({"role": "user", "content": message})

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 300,
        "temperature": 0.7,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            ai_response = data["choices"][0]["message"]["content"].strip()

            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"response": ai_response, "status": "success"}),
            }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.read else str(e)
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "response": "Ошибка ИИ. Попробуйте позже.",
                "status": "error",
                "debug": error_body[:200],
            }),
        }
    except Exception as e:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "response": "Не удалось связаться с ИИ. Проверьте интернет.",
                "status": "error",
            }),
        }
