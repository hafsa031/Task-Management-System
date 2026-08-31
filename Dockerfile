FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Since everything from backend is copied directly into /app, main.py is right here!
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}