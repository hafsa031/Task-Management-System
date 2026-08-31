FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project files
COPY . .

# Move into the backend/app directory so Python can load main.py natively
WORKDIR /app/backend/app

# Run uvicorn pointing straight to main:app from its working directory
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}