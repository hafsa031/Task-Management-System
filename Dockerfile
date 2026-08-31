FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Since main.py is inside the app folder, point to app.main:app
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}