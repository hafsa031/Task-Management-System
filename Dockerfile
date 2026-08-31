FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the current directory (which is now 'backend')
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else from 'backend' into /app
COPY . .

# Since main.py is inside app/main.py relative to backend, target app.main:app
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}