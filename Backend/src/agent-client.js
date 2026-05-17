export async function sendAgentMessage(messages, opts = {}) {
  const baseUrl = (opts.baseUrl || 'http://localhost:4111').replace(/\/+$/, '');
  const agentId = opts.agentId || 'ciges-agent';
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };

  // Body exactamente igual que tu curl
  const body = { messages };

  const res = await fetch(`${baseUrl}/api/agents/${encodeURIComponent(agentId)}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mastra agent generate error ${res.status}: ${text}`);
  }

  return await res.json();
}

export function extractAssistantText(resp) {
  if (!resp) return '';
  if (typeof resp.output_text === 'string' && resp.output_text.trim()) return resp.output_text;
  if (typeof resp.text === 'string' && resp.text.trim()) return resp.text;
  if (resp?.result?.response) return resp.result.response;
  if (resp?.result?.text) return resp.result.text;
  return JSON.stringify(resp);
}