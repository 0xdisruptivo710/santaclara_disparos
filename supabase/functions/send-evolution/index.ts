// Envio de mensagens via Evolution API (instância Santaclara).
// Mantém a mesma interface { to, text } usada pelo app.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_URL = (Deno.env.get("EVOLUTION_API_URL") ?? "https://aios-evolution.yspmhc.easypanel.host").replace(/\/+$/, "");
const INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") ?? "Santaclara";
const API_KEY = Deno.env.get("EVOLUTION_API_KEY") ?? "CDAA55426B59-478B-AB08-1BC157ED34E5";

function normalizeNumber(raw: string): string {
  const d = String(raw).replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return d;
  if (d.length === 10 || d.length === 11) return "55" + d;
  return d;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { to, text } = await req.json();
    if (!to || !text) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'text'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const number = normalizeNumber(String(to));

    const res = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
      },
      body: JSON.stringify({ number, text }),
    });

    const responseText = await res.text();
    let data: unknown;
    try { data = JSON.parse(responseText); } catch { data = responseText; }

    if (!res.ok) {
      console.error("Evolution error", res.status, data);
      return new Response(JSON.stringify({ success: false, status: res.status, data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-evolution error", e);
    return new Response(JSON.stringify({ success: false, error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
