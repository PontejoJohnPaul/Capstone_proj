"""
sms_gateway.py

Thin wrapper around the Semaphore SMS API
(https://semaphore.co/docs). This module ONLY sends a single SMS and
reports success/failure -- it does NOT touch sms_queue or sms_logs.
That orchestration lives in sms_sender.py.

Requires SEMAPHORE_API_KEY in .env.

NOTE ON THE FREE TRIAL:
- Semaphore's free trial account ships with a limited number of credits
  and a default sender name ("Semaphore"). A custom sender name requires
  a paid/verified account. If SEMAPHORE_SENDER_NAME is not set, this
  module omits it so the API falls back to the trial default.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

SEMAPHORE_API_KEY = os.getenv("SEMAPHORE_API_KEY")
SEMAPHORE_SENDER_NAME = os.getenv("SEMAPHORE_SENDER_NAME")  # optional

SEMAPHORE_URL = "https://api.semaphore.co/api/v4/messages"


def send_sms(phone_number, message):
    """
    Sends a single SMS via Semaphore.

    Returns:
        {
            "success": bool,
            "response": <parsed JSON or error string>,
        }
    """

    if not SEMAPHORE_API_KEY:
        return {
            "success": False,
            "response": "SEMAPHORE_API_KEY is not set in .env",
        }

    payload = {
        "apikey": SEMAPHORE_API_KEY,
        "number": phone_number,
        "message": message,
    }

    if SEMAPHORE_SENDER_NAME:
        payload["sendername"] = SEMAPHORE_SENDER_NAME

    try:
        response = requests.post(SEMAPHORE_URL, data=payload, timeout=15)
        response.raise_for_status()

        data = response.json()

        # Semaphore returns a list of message objects on success, e.g.
        # [{"message_id": ..., "status": "Pending", ...}]
        if isinstance(data, list) and len(data) > 0:
            return {"success": True, "response": data}

        # Semaphore returns a dict with an "error"/"message" key on failure
        return {"success": False, "response": data}

    except requests.exceptions.RequestException as e:
        return {"success": False, "response": str(e)}


if __name__ == "__main__":

    result = send_sms("09171234567", "Test SMS from GrainSense AI (Semaphore).")
    print(result)
