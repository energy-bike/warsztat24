export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env.RETELL_API_KEY || !env.RETELL_AGENT_ID) {
      return new Response(
        JSON.stringify({ error: "Missing RETELL_API_KEY or RETELL_AGENT_ID" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

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

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Retell request failed", details: String(err) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
