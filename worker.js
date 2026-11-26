export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/call") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }

      const apiKey = env.RETELL_API_KEY;
      const agentId = env.RETELL_AGENT_ID || "agent_3815bd5939a6301026ff5ea9e9";

      if (!apiKey || !agentId) {
        return new Response(
          JSON.stringify({ error: "Missing RETELL_API_KEY or RETELL_AGENT_ID" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const response = await fetch("https://api.retellai.com/create-web-call", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            agent_id: agentId
          })
        });

        const text = await response.text();
        let data = {};
        try {
          data = JSON.parse(text);
        } catch {
          return new Response(
            JSON.stringify({
              error: `HTTP ${response.status} non-JSON: ${text.slice(0, 300) || "(empty)"}`
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: data.message || data.error || `Retell HTTP ${response.status}`,
              details: data
            }),
            { status: response.status, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Retell request failed", details: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
