#!/usr/bin/env node
// Minimal Unifically REST client, for when the Unifically MCP server isn't installed but a key is.
// Prefer the MCP tools when they exist. Read the model's docs page (https://docs.unifically.com/llms.txt)
// before the first run of a model in a session: parameters change and every run is billed.
//
// Key: UNIFICALLY_API_KEY from the environment, or --env <path to .env file> (never printed).
//
//   node unifically.mjs dry  <model> '<json input>'            -> price, spends nothing
//   node unifically.mjs run  <model> '<json input>'            -> task id
//   node unifically.mjs get  <task_id>                          -> status + output urls
//   node unifically.mjs wait <task_id> [outdir] [name]          -> polls, downloads every output url
//
// Examples
//   music: suno-ai/music {"mv":"chirp-hawk","custom":true,"make_instrumental":true,"title":"x","tags":"...","negative_tags":"...","prompt":"[Instrumental]\n[Intro]\n[Drop]"}
//   sfx:   elevenlabs/sound-effect {"text":"tight tactile low UI tap","duration":0.5,"prompt_influence":0.75}
//   image: google/nano-banana-pro {"prompt":"...","aspect_ratio":"16:9","resolution":"2K","image_urls":["https://..."]}
import fs from "node:fs";
import path from "node:path";

const API = "https://api.unifically.com/v1";
const argv = process.argv.slice(2);
const envIdx = argv.indexOf("--env");
let key = process.env.UNIFICALLY_API_KEY;
if (envIdx !== -1) {
  const txt = fs.readFileSync(argv[envIdx + 1], "utf8");
  const m = txt.match(/^UNIFICALLY_API_KEY=(.*)$/m);
  if (m) key = m[1].trim().replace(/^["']|["']$/g, "");
  argv.splice(envIdx, 2);
}
if (!key) {
  console.error("UNIFICALLY_API_KEY not set (env or --env <file>)");
  process.exit(1);
}
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const [mode, a, b, c] = argv;

async function get(id) {
  const r = await fetch(`${API}/tasks/${id}`, { headers });
  return r.json();
}
// Every media URL in the task output (image_url(s), video_url, audio_url, audio_url1/2, ...).
const urlsOf = (data) => JSON.stringify(data.output ?? data).match(/https:\/\/[^"\\\s]+/g) || [];

if (mode === "dry" || mode === "run") {
  const body = { model: a, input: JSON.parse(b) };
  if (mode === "dry") body.dry_run = true;
  const r = await fetch(`${API}/tasks`, { method: "POST", headers, body: JSON.stringify(body) });
  console.log(JSON.stringify(await r.json()));
} else if (mode === "get") {
  console.log(JSON.stringify(await get(a)));
} else if (mode === "wait") {
  const outdir = b || ".";
  const name = c || a;
  for (let i = 0; i < 180; i++) {
    const j = await get(a);
    const st = j?.data?.status;
    if (st === "completed") {
      fs.mkdirSync(outdir, { recursive: true });
      const urls = [...new Set(urlsOf(j.data))];
      if (!urls.length) {
        console.error("completed but no media URLs found in:", JSON.stringify(j.data));
        process.exit(4);
      }
      for (const [n, u] of urls.entries()) {
        const ext = path.extname(new URL(u).pathname) || ".bin";
        const file = path.join(outdir, urls.length > 1 ? `${name}-${n + 1}${ext}` : `${name}${ext}`);
        fs.writeFileSync(file, Buffer.from(await (await fetch(u)).arrayBuffer()));
        console.log(file);
      }
      process.exit(0);
    }
    if (st === "failed") {
      console.error(JSON.stringify(j));
      process.exit(2);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.error("timed out waiting for task");
  process.exit(3);
} else {
  console.error("usage: unifically.mjs dry|run <model> '<json>'  |  get <id>  |  wait <id> [outdir] [name]  [--env file]");
  process.exit(1);
}
