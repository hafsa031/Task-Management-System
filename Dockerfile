FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Sets the python path so the container can locate the backend module correctly
ENV PYTHONPATH=/app

CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}