import os, requests
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("SEMAPHORE_API_KEY")
r = requests.get("https://api.semaphore.co/api/v4/account", params={"apikey": key})
print("Status code:", r.status_code)
print("Response:", r.text)