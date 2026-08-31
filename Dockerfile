FROM python:3.11-slim

WORKDIR /app

# Copy the contents of your backend folder directly into /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Now main.py is right in the working directory (/app), so we just call main:app
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}