FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install poetry for packages management
RUN python -m pip install poetry
RUN poetry config virtualenvs.create false

# Use /app as the working directory
WORKDIR /app

# Copy poetry files & install the dependencies
COPY pyproject.toml /app
COPY poetry.lock /app

RUN poetry install --no-interaction --no-ansi --no-root

# Finally copy the application source code and install root
COPY . /app

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
