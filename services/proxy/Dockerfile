FROM python:3.12-slim
ENV PIP_DEFAULT_TIMEOUT=180 \
    PYTHONUNBUFFERED=1
WORKDIR /app
COPY app/ /app/app
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir --timeout 300 --retries 5 aiohttp httpx uvloop
CMD ["python", "-m", "app.main"]
