import { useState, useEffect } from "react";
import Card from "./components/Card";
import "./App.css";

const EMOJI = ["🍕", "🍝", "🍋", "🧀", "🍅", "🍷", "☕", "🍨", "🥖", "🫒"];
const LEVELS = { facile: 6, medio: 8, difficile: 10 };

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairs) {
  const deck = EMOJI.slice(0, pairs).flatMap((symbol, i) => [
    { id: i * 2, symbol, pairId: i },
    { id: i * 2 + 1, symbol, pairId: i },
  ]);
  return shuffle(deck);
}

function loadBest(level) {
  const value = localStorage.getItem(`memory-best-${level}`);
  return value ? Number(value) : null;
}

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function App() {
  const [level, setLevel] = useState("facile");
  const [cards, setCards] = useState(() => buildDeck(LEVELS.facile));
  const [flipped, setFlipped] = useState([]); // id delle carte girate (max 2)
  const [matched, setMatched] = useState([]); // pairId delle coppie trovate
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(() => loadBest("facile"));

  const pairs = LEVELS[level];
  const won = matched.length === pairs;

  function newGame(nextLevel = level) {
    setLevel(nextLevel);
    setCards(buildDeck(LEVELS[nextLevel]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setBest(loadBest(nextLevel));
  }

  // Cronometro: parte al primo click, si ferma alla vittoria
  useEffect(() => {
    if (!started || won) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [started, won]);

  // Salva il record (meno mosse = meglio) nel localStorage
  useEffect(() => {
    if (!won) return;
    if (best === null || moves < best) {
      setBest(moves);
      localStorage.setItem(`memory-best-${level}`, moves);
    }
  }, [won, moves, best, level]);

  function handleFlip(card) {
    const alreadyUp = flipped.includes(card.id) || matched.includes(card.pairId);
    if (flipped.length === 2 || alreadyUp) return;

    setStarted(true);
    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((c) => c.id === id));
      if (a.pairId === b.pairId) {
        setMatched((m) => [...m, a.pairId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Memory della tavola</h1>
        <p>Trova tutte le coppie con meno mosse possibili.</p>
      </header>

      <div className="levels" role="group" aria-label="Difficoltà">
        {Object.keys(LEVELS).map((name) => (
          <button
            key={name}
            className={`level ${name === level ? "active" : ""}`}
            onClick={() => newGame(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="stats">
        <div><span>Mosse</span><strong>{moves}</strong></div>
        <div><span>Tempo</span><strong>{formatTime(seconds)}</strong></div>
        <div><span>Record</span><strong>{best ?? "–"}</strong></div>
      </div>

      <section className="board" style={{ "--cols": pairs === 10 ? 5 : 4 }}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={flipped.includes(card.id) || matched.includes(card.pairId)}
            isMatched={matched.includes(card.pairId)}
            onFlip={handleFlip}
          />
        ))}
      </section>

      {won && (
        <div className="win" role="status">
          <p>
            Completato in <strong>{moves}</strong> mosse e{" "}
            <strong>{formatTime(seconds)}</strong>.
          </p>
          <button className="restart" onClick={() => newGame()}>
            Gioca ancora
          </button>
        </div>
      )}

      {!won && (
        <button className="restart ghost" onClick={() => newGame()}>
          Ricomincia
        </button>
      )}
    </main>
  );
}