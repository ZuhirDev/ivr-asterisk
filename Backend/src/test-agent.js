(async() => {
  try {
    const res = await fetch('http:0.0.0.0:4111/api/agents/ciges-agent/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }] })
    });
    const data = await res.json();
    console.log('✅ Conexión exitosa:', data);
  } catch (err) {
    console.error('❌ No se pudo conectar al agente:', err);
  }
})();