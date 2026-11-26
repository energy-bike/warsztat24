export async function onRequestPost(context) {
  const { env } = context;

  try {
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RETELL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: env.RETELL_AGENT_ID
      })
    });

    const rawText = await response.text();
    let data = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { error: rawText || `Błąd odpowiedzi Retell AI (HTTP ${response.status})` };
    }

    if (!response.ok && !data.error) {
      data.error = data.message || `Błąd połączenia z Retell AI (HTTP ${response.status})`;
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Błąd wewnętrzny funkcji /api/call" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}