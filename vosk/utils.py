import os
from fastapi import UploadFile

AUDIO_DIR = './audio_files'

# Verificar si el directorio existe, si no, lo creamos
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

def save_audio_file(file: UploadFile):
    """Guardar el archivo de audio recibido en el directorio AUDIO_DIR"""
    file_location = os.path.join(AUDIO_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(file.file.read())
    return file_location