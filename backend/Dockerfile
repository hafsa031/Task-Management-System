FROM python:3.10-slim

WORKDIR /app

# Copy requirements from the current directory (backend/)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files (app/, etc.) into /app
COPY . .

EXPOSE 8000

# Added --proxy-headers and --forwarded-allow-ips to fix Render proxy 400 Bad Request
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]