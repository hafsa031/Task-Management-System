FROM python:3.11-slim

WORKDIR /app

# Copy the requirements file from the build context
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app folder and other contents into /app
COPY . .

# Run uvicorn pointing to app.main:app, ensuring /app can locate the 'app' directory
ENV PYTHONPATH=/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]