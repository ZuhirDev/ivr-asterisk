from fastapi import FastAPI, File, UploadFile
from transcribe import transcribe_audio

# https://voicemaker.in/

app = FastAPI()

# Ruta para verificar que el servicio esté funcionando
@app.get("/health")
def health():
    return {"status": "Service is running"}

# Ruta para procesar el archivo de audio y transcribirlo
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    transcription = await transcribe_audio(file)
    return {"transcription": transcription}