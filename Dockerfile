FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Explicitly navigate into the folder where main.py lives and run uvicorn
WORKDIR /app/backend
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}