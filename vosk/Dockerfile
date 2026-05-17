# Usamos una imagen base de Python
FROM python:3.9-slim

# Establecemos el directorio de trabajo en el contenedor
WORKDIR /app

# Instalamos las dependencias del sistema necesarias para Vosk y FastAPI
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo `requirements.txt` y lo instalamos
COPY requirements.txt .

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código fuente del proyecto al contenedor
COPY . .

# Asegúrate de que el modelo de Vosk esté en la ruta correcta dentro del contenedor
# Puedes copiar el modelo aquí si es necesario, o bien usar una ruta compartida de volumen en docker-compose.
# COPY vosk-model-small-es-0.42 /app/vosk-model-small-es-0.42

# Exponemos el puerto en el que FastAPI estará corriendo
EXPOSE 8000

# Comando para ejecutar el servidor de FastAPI con Uvicorn cuando el contenedor inicie
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]