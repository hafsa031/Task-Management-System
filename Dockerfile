FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from the backend folder into /app
COPY backend/ .

# Since main.py is now copied directly into /app, we run main:app
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}