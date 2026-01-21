# Use official PaddleOCR image as base
FROM paddlecloud/paddleocr:2.6-cpu-latest

# Add PaddleOCR to Python path
ENV PYTHONPATH="${PYTHONPATH}:/home/PaddleOCR"

# Set working directory
WORKDIR /app

# Install additional dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    aiosqlite \
    sqlalchemy \
    pydantic \
    pydantic-settings \
    aiofiles \
    pdf2image \
    greenlet

# Install poppler for PDF support
RUN apt-get update && apt-get install -y poppler-utils && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Create directories
RUN mkdir -p uploads outputs data

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
