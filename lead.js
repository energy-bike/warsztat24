export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { company, name, phone, type } = body;

    if (!phone || !name) {
      return new Response(JSON.stringify({ ok: false, error: "Brak danych" }), { status: 400 });
    }

    if (env.SMSAPI_TOKEN && env.MY_PHONE) {
      const message = `Nowy lead Warsztat24: ${company || "Brak nazwy"}, ${name}, tel: ${phone} (${type})`;
      const params = new URLSearchParams({
        to: env.MY_PHONE,
        message: message,
        format: "json"
      });

      await fetch("https://api.smsapi.pl/sms.do", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.SMSAPI_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}