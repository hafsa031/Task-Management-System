FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the main root folder
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project files into the container
COPY . .

# Points to backend/app/main.py
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}