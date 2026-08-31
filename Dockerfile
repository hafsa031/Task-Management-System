FROM python:3.11-slim

WORKDIR /app

# Copy requirements from your backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything inside the backend folder directly into the container root (/app)
COPY backend/ .

# Since main.py is now inside app/main.py, run app.main:app directly
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}