"use client";

import dynamic from "next/dynamic";
import GameLoading from "./GameLoading";

const MatchingGame = dynamic(() => import("./MatchingGame"), {
  ssr: false,
  loading: () => <GameLoading />,
});

export default function GameClient() {
  return <MatchingGame />;
}
