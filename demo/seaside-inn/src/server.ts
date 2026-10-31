import { createServer } from "node:http";
import { book, cancel, Ledger } from "./reservations.ts";

const ledger = new Ledger();
const port = Number(process.env.PORT ?? 4010);

createServer((req, res) => {
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.method !== "POST" || (req.url !== "/reservations" && req.url !== "/reservations/cancel")) return send(404, { error: "not_found" });
    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return send(400, { error: "invalid_json" });
    }
    const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, String(v)]));
    const handle = req.url === "/reservations" ? book : cancel;
    const out = handle({ method: "POST", path: req.url, headers, body }, ledger);
    send(out.status, out.body);
  });
}).listen(port, () => console.log(`seaside-inn booking API on :${port}`));
