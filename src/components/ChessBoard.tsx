'use client'
import { ChessGame } from "@/lib/game"
import { ChessPiece } from "@/lib/piece"
import { Dispatch, SetStateAction, useState } from "react"

type ChessBoardProps = {
    game:ChessGame,
    perspective: "black" | "white"
}

export default function ChessBoard({ game, perspective }:ChessBoardProps) {
    const [selectedTile, selectTile] = useState<Coordinate | null>(null);

    let display:JSX.Element[] = [];
    let layout = game.layout;

    let moveOptions:Coordinate[] = [];
    let selectedPiece = null;
    if(selectedTile !== null) 
        selectedPiece = game.getPiece(selectedTile)
    if(selectedPiece !== null)
        moveOptions = selectedPiece.getMobility(layout, selectedPiece.side === "black");

    for(let i=0;i<layout.length;i++){
        let row:JSX.Element[] = [];

        for(let j=0;j<layout[i].length;j++){
            let location = {x: j, y: i};
            let isMoveOption = false;
            moveOptions.forEach(o=>{
                if(o.x==j && o.y==i)
                    isMoveOption = true;
            })

            row.push(<Tile 
                key={j}
                color={(i+j)%2?"white":"#678"}
                location={location}
                game={game}
                select={selectTile}
                selectedTile={selectedTile}
                isMoveOption={isMoveOption}
            />);
        }
        display.push(<div className={`flex ${perspective==="black"?"flex-row-reverse":"flex-row"}`} key={i}>{row}</div>);
    }

    return (
        <div className="bg-slate-700 rounded-lg p-2">
            <div className={`rounded-lg border-8 border-black bg-black flex ${perspective==="black"?"flex-col-reverse":"flex-col"}`}>{display}</div>
            <div>
                <div className="p-1 text-lg font-bold grid grid-cols-2 text-center font-mono">
                    <p>{game.getNumPossibleMoves(game.move)===0?`
                        ${game.move==="white"?"BLACK":"WHITE"} WINS
                    `:`${game.move.toUpperCase()}'S MOVE`}</p>
                    <p>TURN {Math.round(game.turn/2)}</p>
                </div>
                <Captured captured={game.casualties} />
            </div>
        </div>
    );
}


type TileProps = {
    key:number,
    location:Coordinate,
    color:string,
    game:ChessGame,

    select:Dispatch<SetStateAction<Coordinate | null>>,
    selectedTile:Coordinate | null,

    isMoveOption:boolean
}

function Tile({ location, color, game, select, selectedTile, isMoveOption }:TileProps) {
    let render = [];

    let icon = game.getPiece(location) !== null ? (
        <svg width="64" height="64">
            <image xlinkHref={game.getPiece(location)?.iconPath} width="64" height="64"/>    
        </svg>
    ) : <div className="w-16 h-16"/>

    render.push(<div key={0}>
        <button onClick={()=>{select(location);}} className="tile">
            {icon}
        </button>

        <style jsx>{`
            .tile {
                background-color: ${color};
                width: 64px;
                height: 64px;
            }
        `}</style>
    </div>);

    if(isMoveOption && selectedTile) {
        if(game.move === game.getPiece(selectedTile)?.side) {
            render.push(
                <button key={1} onClick={()=>{game.movePiece(selectedTile, location); select(null);}} className="w-16 h-16 absolute top-0 left-0 z-10 bg-cyan-300/50 hover:bg-cyan-400/90 animate-pulse"/>
            );
        } else render.push(
            <button key={1} onClick={()=>{select(null)}} className="w-16 h-16 absolute top-0 left-0 z-10 bg-red-400/30 animate-pulse"/>
        )
    }

    return (<>
        <div className="flush relative">
            {render}
        </div>
        <style jsx>{`
            .flush {
                margin-bottom: -6.5px;
            }
        `}</style>
    </>)
}

function Captured({ captured }:{ captured:ChessPiece[] }) {
    const lists:{[index:string]:JSX.Element[]} = {
        black:[],
        white:[]
    }

    for(let i=0;i<captured.length;i++){
        lists[captured[i].side].push(
            <svg key={i} className="icon" width="24" height="24">
                <image xlinkHref={captured[i].iconPath} width="24" height="24"/>    
            </svg>
        )
    }

    return (<>
        <div className="flex flex-row justify-between h-6 w-full">
            <div className="flex flex-row">{lists.white}</div>
            <div className="flex flex-row-reverse">{lists.black}</div>
        </div>
    </>)
}