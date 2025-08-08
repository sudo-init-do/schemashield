# services/proxy/Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY app/ /app/app
RUN pip install --no-cache-dir aiohttp httpx uvloop
ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "app.main"]
