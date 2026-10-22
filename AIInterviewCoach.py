import json
import os
from pathlib import Path

from flask import Flask, jsonify, render_template, request
from openai import OpenAI

# flask backend server
app = Flask(__name__)
TEMPLATE_PATH = Path(__file__).resolve().parent / "prompt_template.txt"


@app.get("/")
def index():
    return render_template("index.html")

# load the prompt template and replace placeholders with actual values
def build_prompt(role: str, topic: str, content: str) -> str:
    """Load the template and replace all supported placeholder formats."""
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    replacements = {
        "[ROLE]": role,
        "[TOPIC]": topic,
        "[TOPICS]": topic,
        "[CONTENT]": content,
        "{ROLE}": role,
        "{TOPIC}": topic,
        "{TOPICS}": topic,
        "{CONTENT}": content,
    }

    for placeholder, value in replacements.items():
        template = template.replace(placeholder, value)

    return template

# API endpoint post request to generate a response from the model
@app.post("/generate")
def generate():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    values = {name: data.get(name) for name in ("role", "topic", "content")}
    missing = [
        name
        for name, value in values.items()
        if not isinstance(value, str) or not value.strip()
    ]

    if missing:
        return jsonify({"error": "Missing or empty parameters.", "parameters": missing}), 400

    if not os.getenv("OPENAI_API_KEY"):
        return jsonify({"error": "OPENAI_API_KEY is not set."}), 500

    try:
        client = OpenAI()
        response = client.responses.create(
            model="gpt-6-luna",
            input=build_prompt(values["role"], values["topic"], values["content"]),
        )
        result = json.loads(response.output_text)
    except json.JSONDecodeError:
        return jsonify({"error": "The model did not return valid JSON."}), 502
    except Exception as error:
        app.logger.exception("OpenAI request failed")
        return jsonify({"error": str(error)}), 502

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
