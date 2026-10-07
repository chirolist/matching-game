"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../page.module.css";
import {
  MATCH_PAUSE_MS,
  MISS_REVEAL_MS,
  TOTAL_PAIRS,
  createShuffledDeck,
  formatElapsed,
  type CardData,
} from "./deck";

export default function MatchingGame() {
  const [cards, setCards] = useState<CardData[]>(() => createShuffledDeck());
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [timerOn, setTimerOn] = useState(true);
  const [round, setRound] = useState(0);
  const [cleared, setCleared] = useState(false);

  const cardsRef = useRef<CardData[]>(cards);
  const openIdsRef = useRef<string[]>([]);
  const matchedIdsRef = useRef<string[]>([]);
  const lockRef = useRef(false);
  const clearedRef = useRef(false);
  const timerOnRef = useRef(false);
  const secondsRef = useRef(0);
  const generationRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!timerOn) {
      timerOnRef.current = false;
      return;
    }

    timerOnRef.current = true;
    const startedAt = Date.now() - secondsRef.current * 1000;
    const timerId = window.setInterval(() => {
      if (!timerOnRef.current) {
        return;
      }
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      secondsRef.current = elapsed;
      setSeconds(elapsed);
    }, 200);

    return () => {
      timerOnRef.current = false;
      window.clearInterval(timerId);
    };
  }, [timerOn, round]);

  useEffect(() => {
    if (cleared) {
      restartButtonRef.current?.focus();
    }
  }, [cleared]);

  function clearPendingTimeout() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function selectCard(id: string) {
    const deck = cardsRef.current;
    if (clearedRef.current || lockRef.current) {
      return;
    }
    if (matchedIdsRef.current.includes(id)) {
      return;
    }
    if (openIdsRef.current.includes(id) || openIdsRef.current.length >= 2) {
      return;
    }

    const nextOpen = [...openIdsRef.current, id];
    openIdsRef.current = nextOpen;
    setOpenIds(nextOpen);

    if (nextOpen.length < 2) {
      return;
    }

    const first = deck.find((card) => card.id === nextOpen[0]);
    const second = deck.find((card) => card.id === nextOpen[1]);
    if (!first || !second) {
      return;
    }

    setMoves((value) => value + 1);
    lockRef.current = true;
    setLocked(true);

    const generation = generationRef.current;
    const isMatch = first.symbol === second.symbol;

    if (isMatch) {
      const nextMatched = [...matchedIdsRef.current, first.id, second.id];
      matchedIdsRef.current = nextMatched;
      setMatchedIds(nextMatched);
      openIdsRef.current = [];
      setOpenIds([]);

      const isClear = nextMatched.length === deck.length;
      if (isClear) {
        clearedRef.current = true;
        timerOnRef.current = false;
        setTimerOn(false);
      }

      timeoutRef.current = window.setTimeout(() => {
        if (generationRef.current !== generation) {
          return;
        }
        lockRef.current = false;
        setLocked(false);
        if (isClear) {
          setCleared(true);
        }
        timeoutRef.current = null;
      }, isClear ? 800 : MATCH_PAUSE_MS);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      if (generationRef.current !== generation) {
        return;
      }
      openIdsRef.current = [];
      setOpenIds([]);
      lockRef.current = false;
      setLocked(false);
      timeoutRef.current = null;
    }, MISS_REVEAL_MS);
  }

  function restart() {
    const previousOrder = cardsRef.current.map((card) => card.id);
    const deck = createShuffledDeck(previousOrder);

    generationRef.current += 1;
    clearPendingTimeout();

    cardsRef.current = deck;
    openIdsRef.current = [];
    matchedIdsRef.current = [];
    lockRef.current = false;
    clearedRef.current = false;
    secondsRef.current = 0;
    timerOnRef.current = true;

    setCards(deck);
    setOpenIds([]);
    setMatchedIds([]);
    setMoves(0);
    setSeconds(0);
    setLocked(false);
    setCleared(false);
    setTimerOn(true);
    setRound((value) => value + 1);
  }

  const pairs = matchedIds.length / 2;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>神経衰弱</h1>
          <p>同じ絵柄のカードを2枚選んで、すべてのペアをそろえよう</p>
        </header>

        <section className={styles.stats} aria-label="ゲーム情報">
          <p>
            ペア：{pairs} / {TOTAL_PAIRS}
          </p>
          <p>手数：{moves}</p>
          <p className={styles.timer}>{formatElapsed(seconds)}</p>
        </section>

        <div key={round} className={styles.board} role="group" aria-label="カード">
          {cards.map((card, index) => {
            const matched = matchedIds.includes(card.id);
            const faceUp = matched || openIds.includes(card.id);
            const clickable = !cleared && !locked && !matched && !openIds.includes(card.id);

            return (
              <button
                key={card.id}
                type="button"
                className={`${styles.card} ${faceUp ? styles.faceUp : ""} ${clickable ? styles.clickable : ""} ${matched ? styles.matched : ""}`}
                onClick={() => selectCard(card.id)}
                disabled={!clickable}
                aria-label={faceUp ? `${card.symbol} のカード` : `裏向きのカード ${index + 1}`}
                data-symbol={card.symbol}
                data-face={faceUp ? "up" : "down"}
              >
                <span className={styles.inner} aria-hidden="true">
                  <span className={styles.back}>
                    <span className={styles.mark}>？</span>
                  </span>
                  <span className={styles.front}>{card.symbol}</span>
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {cleared ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="clear-title">
          <div className={styles.dialog}>
            <h2 id="clear-title">GAME CLEAR!</h2>
            <p>クリアタイム：{formatElapsed(seconds)}</p>
            <p>手数：{moves}</p>
            <p>
              {pairs} / {TOTAL_PAIRS} ペア
            </p>
            <button
              ref={restartButtonRef}
              type="button"
              className={styles.restart}
              onClick={restart}
            >
              もう一度遊ぶ
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
