# Santa Clara — Disparos

Ferramenta interna da Santa Clara para buscar clientes por interesse em veículos e
disparar mensagens de WhatsApp em lote via **Evolution API**.

## Stack
- Vite + React + TypeScript + Tailwind (shadcn/ui)
- Supabase (banco de leads `Interesse_SantaClara`, histórico `envios` e Edge Function `send-evolution`)
- Evolution API (instância `Santaclara`) para o envio das mensagens

## Disparos
- Lotes de até **50 contatos** por envio.
- Intervalo de **30 segundos** entre cada mensagem para evitar bloqueios da conta.
- A Edge Function `send-evolution` chama `POST /message/sendText/{instance}` da Evolution API.

## Variáveis de ambiente (Edge Function `send-evolution`)
Opcionais — há fallback no código:
- `EVOLUTION_API_URL` (ex.: `https://aios-evolution.yspmhc.easypanel.host`)
- `EVOLUTION_INSTANCE` (ex.: `Santaclara`)
- `EVOLUTION_API_KEY`

## Desenvolvimento
```sh
npm install
npm run dev
```
