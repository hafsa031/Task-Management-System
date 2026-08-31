FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the backend folder relative to the main root
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend contents directly into /app
COPY backend/ .

# Run uvicorn directly on app.main:app
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}