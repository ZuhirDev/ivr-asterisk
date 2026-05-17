from vosk import Model, KaldiRecognizer
import wave
import json
import os
from utils import save_audio_file

# Cargar el modelo Vosk (ajusta la ruta según sea necesario)
MODEL_PATH = "vosk-model-small-es-0.42"
if not os.path.exists(MODEL_PATH):
    raise Exception(f"El modelo no está en la ruta {MODEL_PATH}. Por favor, descárgalo y colócalo allí.")

model = Model(MODEL_PATH)

async def transcribe_audio(file):
    # Guardar el archivo de audio recibido
    file_location = save_audio_file(file)
    
    # Abrir el archivo de audio para procesarlo
    wf = wave.open(file_location, "rb")
    
    # Configurar el reconocedor de voz
    rec = KaldiRecognizer(model, wf.getframerate())
    
    # Procesar el audio y obtener el texto transcrito
    result = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result += rec.Result()
    
    result += rec.FinalResult()
    
    # Obtener el texto transcrito
    result_json = json.loads(result)
    return result_json.get("text", "")