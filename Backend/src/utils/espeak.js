
export async function generateAudio(text) {
  try {
    const response = await fetch("http://espeak:5000/tts", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Error generating audio: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.audio.replace('.wav','');
  } catch (err) {
    console.error('❌ Error generating audio:', err.message); 
    throw err;
  }
}