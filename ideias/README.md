# ideias/ — round 1 prototypes (index.html untouched)

| File | What |
|---|---|
| `original.html` | Unmodified copy of `../index.html`, used as the baseline |
| `cores.html` | Idea 1: a colored "tile" behind each word. The color travels with the word (gatos/gato and ato/rato keep their color; the hidden word's tile moves with it). Canvas plus HTML wall. "Mostrar resposta" switches to plain text with the marks |
| `forma.html` | Idea 2: a heart plateau at P−1 made of filler words, with the phrase words at P−2 inside it. Self-contained; built from `relevo.js` + `forma_gen.js` + `forma_ana.js` spliced into a copy of index.html |
| `relevo.js` | Generic **depth-profile → real-words** row generator (text SIRDS). Any per-column separation profile with ±1 steps works, including plateaus wider than P and nested levels |
| `magic.html` | Idea 3: colorful dot-texture SIRDS with the phrase drawn in giant letters. It uses the page's own `analisar()` unchanged |
| `eval_batch.js`, `eval_forma.js`, `eval_magic.js` | `cdp-eval --file` batch verifiers. They call the page's own `gerar`/`conferir`/`mostrarAnalise` |
| `export.js`, `save_export.py` | Export the wall PNG and the decoded-map PNG |
| `lock_proxy.py` | Coarse "lock strength" proxy: blurred \|I(x)−I(x−d)\| at d=P vs. the best competing lag |
| `*_img.png` / `*_mapa.png` | Each wall and its decoded depth map (`*_img14` = the 14-px version the decoder sees) |

Verification commands are in the shared notes file `round1-peer-notes.md`.
