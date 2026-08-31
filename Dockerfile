FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies from the root directory
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project files into the container
COPY . .

# Since main.py is in the root directory, we call main:app directly
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}