# GrainSense AI — VPS Deployment (Hostinger, Ubuntu)

This makes FastAPI + `ai_engine.py` (Random Forest + Gemini + SMS) start
automatically on boot and auto-restart if they crash — no manual `cmd`/
terminal commands needed after this one-time setup.

## 1. Upload the project

Upload the `grainsense_ai` folder to `/opt/grainsense_ai` on the VPS
(via `scp`, `git clone`, or Hostinger's file manager).

## 2. Create a virtual environment and install dependencies

```bash
cd /opt/grainsense_ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

## 3. Create the real `.env`

```bash
cp .env .env
nano .env   # fill in GEMINI_API_KEY and SEMAPHORE_API_KEY
```

## 4. Point database.py at the VPS's MySQL

Since MySQL now runs on the same VPS as this Python code (not a
separate Hostinger shared-hosting DB), `database.py`'s `DB_HOST =
"localhost"` should already be correct. Update `DB_USER`/`DB_PASS` to
match the MySQL user you create for `grainsense_final_db`.

## 5. Install the systemd services

```bash
sudo cp deploy/grainsense-fastapi.service /etc/systemd/system/
sudo cp deploy/grainsense-engine.service /etc/systemd/system/

sudo systemctl daemon-reload

sudo systemctl enable grainsense-fastapi
sudo systemctl enable grainsense-engine

sudo systemctl start grainsense-fastapi
sudo systemctl start grainsense-engine
```

`enable` makes both services start automatically every time the VPS
reboots. `Restart=always` in the service files makes them recover on
their own if they crash (e.g. a temporary Gemini API timeout).

## 6. Verify

```bash
sudo systemctl status grainsense-fastapi
sudo systemctl status grainsense-engine

# Live logs (Ctrl+C to stop watching, this does NOT stop the service)
journalctl -u grainsense-engine -f
```

`curl http://localhost:8000/health` should return `{"status":"ok"}`.

## That's it

From this point forward, both processes run permanently in the
background. You never need to open a terminal to "start" the AI again
— only if you want to check logs or deploy a code update.
