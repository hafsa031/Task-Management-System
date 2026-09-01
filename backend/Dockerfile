FROM python:3.10-slim

WORKDIR /app

# Copy requirements from the current directory (backend/)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files (app/, etc.) into /app
COPY . .

EXPOSE 8000

# Since we are inside backend/, 'app.main:app' will point straight to app/main.py
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}