FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the root folder
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . .

# Change working directory directly into the folder where main.py sits
WORKDIR /app/backend/app

# Run uvicorn on main.py directly
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}