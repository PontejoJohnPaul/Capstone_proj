from google import genai
from dotenv import load_dotenv
import os
import json
import time

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODELS = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
]


def _call_gemini(prompt):
    """
    Shared retry/fallback logic across models. Returns the raw text
    response, or None if every model/retry failed.
    """

    for model in MODELS:

        for retry in range(3):

            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )

                return response.text.strip()

            except Exception as e:
                print(f"[Gemini] {model} attempt {retry + 1} failed: {e}")
                time.sleep(5)

    return None


# =========================================================
# REAL-TIME AI (Predictive Pest Risk)
# Called only when Random Forest returns WARNING or DANGER.
# =========================================================

def generate_prediction(storage_report, risk):

    prompt = f"""
You are an agricultural AI expert specializing ONLY in rice (palay) storage.

Sensor Report:

{storage_report}

Random Forest Risk Level:
{risk}

Based on the sensor values,

Return ONLY a JSON object.

Example:

{{
    "predicted_pest":"Rice Weevil",
    "possible_cause":"High humidity and high moisture encourage insect reproduction.",
    "recommendation":"Reduce grain moisture below 14%, improve ventilation, inspect sacks, and clean the storage area."
}}

Do NOT explain anything.
Do NOT use markdown.
Return JSON only.
"""

    text = _call_gemini(prompt)

    if text:
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"[Gemini] Failed to parse JSON: {e}")

    return {
        "predicted_pest": "Unknown",
        "possible_cause": "Unable to generate prediction.",
        "recommendation": "Please check the storage condition.",
    }


# =========================================================
# HISTORICAL AI (Root Cause Analysis)
# Called only when a Moisture Sensor is DISABLED with
# infested (damaged) sacks > 0.
# =========================================================

def generate_root_cause_analysis(batch_summary, readings_summary):
    """
    batch_summary: dict-like info about the batch (total sacks, healthy,
                   damaged/infested, storage duration).
    readings_summary: pre-formatted text summarizing the historical
                   temperature/humidity/moisture trends during storage.
    """

    prompt = f"""
You are an agricultural AI expert specializing ONLY in rice (palay) post-harvest storage.

A storage batch has just finished with reported pest infestation.

Batch Summary:
{batch_summary}

Historical Sensor Readings During Storage:
{readings_summary}

Perform a Root Cause Analysis. Explain, in natural language:
1. Why the infestation likely happened.
2. Which environmental conditions (temperature, humidity, moisture) contributed.
3. Which pests are most likely responsible.
4. Concrete recommendations to avoid the same problem in future storage.

Return ONLY a JSON object in this exact shape:

{{
    "likely_pests": "Rice Weevil, Lesser Grain Borer",
    "root_cause": "Explanation of why infestation likely happened...",
    "contributing_conditions": "Explanation of which environmental conditions contributed...",
    "recommendation": "Concrete steps to avoid this in future storage..."
}}

Do NOT explain anything outside the JSON.
Do NOT use markdown.
Return JSON only.
"""

    text = _call_gemini(prompt)

    if text:
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"[Gemini] Failed to parse Root Cause JSON: {e}")

    return {
        "likely_pests": "Unknown",
        "root_cause": "Unable to generate root cause analysis at this time.",
        "contributing_conditions": "N/A",
        "recommendation": "Please review the batch manually.",
    }


if __name__ == "__main__":

    storage = """
Temperature : 31°C
Humidity : 82%
Moisture : 15%
"""

    print(generate_prediction(storage, "HIGH"))
