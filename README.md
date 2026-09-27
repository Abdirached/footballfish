# FootballFish

A chess-style move evaluator for football matches.

FootballFish converts match events from tracking/event data into a chess-like 12x8 grid
(A1–L8), builds an expected-threat (xT) surface from shot data, and grades every action —
pass, carry, shot — the way Stockfish grades chess moves: with a verdict, a score and the
better alternatives.

```
"Best"  "Excellent"  "Good"  "Inaccuracy"  "Mistake"  "Blunder"
```

## How it works

```
event data (JSON)  ->  grid mapping  ->  xT surface  ->  move grading  ->  web UI
```

- **Grid mapping** (`engine/model.py`): locations are mapped onto a 12-column x 8-row board
  (`A1`–`L8`); columns are split into `buildup` / `midfield` / `attacking` phases, rows into
  `wing` / `halfspace` / `central` bands.
- **Expected threat**: an xT surface is computed from shot events, so moves into dangerous
  zones score higher.
- **Analysis pipeline** (`engine/jdp/`): zone control, shape, superiority and advice modules
  produce per-move grades plus the suggested better move.
- **Move evaluator** (`engine/processor.py`): per event it computes distance, pressure and
  a success probability, and returns a full graded report.

## Project layout

```
engine/            # Python analysis engine
  model.py         # grid mapping, xT surface, pass network, territory control
  processor.py     # event -> graded move report
  jdp/             # analysis pipeline (zones, shape, superiority, advice)
  data/            # data source adapters + types
fish-server/       # Express API (routes: /api/matches, /api/analysis, /api/health)
fish-client/       # Vite front end
start.sh           # runs both server and client
```

## Getting started

```bash
# one command (starts API on :3001 and UI on :5173)
./start.sh
```

Manual setup:

```bash
# API
cd fish-server && npm install && PORT=3001 node bin/www

# UI
cd fish-client && npm install && npm run dev
```

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/matches` | Available matches |
| GET | `/api/analysis` | Graded analysis for a match |
| GET | `/api/health` | Service status |

## Status

Personal R&D project. The engine works end-to-end; the front end is the next area of work.
