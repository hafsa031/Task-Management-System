FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Copy root requirements or backend requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project folder into the container
COPY . .

# Expose port (Render automatically assigns $PORT, but EXPOSE is good practice)
EXPOSE 8000

# Run Uvicorn pointing to the correct path based on your folder structure
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}