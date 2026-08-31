FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the current directory (since Dockerfile is inside backend)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files into the container
COPY . .

# Run Uvicorn pointing straight to your app module
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}