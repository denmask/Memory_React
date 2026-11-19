export default function Card({ card, faceUp, isMatched, onFlip }) {
  return (
    <button
      className={`card ${faceUp ? "up" : ""} ${isMatched ? "matched" : ""}`}
      onClick={() => onFlip(card)}
      aria-label={faceUp ? card.symbol : "Carta coperta"}
    >
      <span className="face back" />
      <span className="face front">{card.symbol}</span>
    </button>
  );
}