FROM python:3.12-slim
ENV PIP_DEFAULT_TIMEOUT=180 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY app/ /app/app

# (Optional) faster DNS for some networks
# RUN echo "nameserver 1.1.1.1" > /etc/resolv.conf

# Install with longer timeout + retries (no cache)
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir --timeout 300 --retries 5 \
      fastapi "uvicorn[standard]" "pydantic>=2" httpx sqlmodel sqlite-utils jsonschema pyyaml

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
