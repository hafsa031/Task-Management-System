FROM python:3.11-slim

WORKDIR /app

# Copy the requirements file from the root directory
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project repository into /app
COPY . .

# Set Python path so 'backend' is recognized as a package module
ENV PYTHONPATH=/app

# Point directly to your nested structure: backend -> app -> main.py
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}