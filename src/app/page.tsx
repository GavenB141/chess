'use client'

import ChessBoard from "@/components/ChessBoard";
import { ChessGame } from "@/lib/game";


export default function Home() {
  const game=new ChessGame();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ChessBoard game={game} perspective="white"/>
    </main>
  )
}
