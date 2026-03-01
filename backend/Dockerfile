# SUB-SENTINEL backend – Hugging Face Spaces Docker image
#
# Build:  docker build -t sub-sentinel-backend .
# Run:    docker run -p 7860:7860 sub-sentinel-backend

FROM python:3.11-slim

# HF Spaces requires port 7860
EXPOSE 7860

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Create weights directory (populated at runtime via env / volume)
RUN mkdir -p weights

# Non-root user for HF Spaces compatibility
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Start the server on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
