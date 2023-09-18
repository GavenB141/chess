import { ChessPiece, backline, frontline } from "./piece";

export class ChessGame {
    layout:(ChessPiece|null)[][] = [
        backline("black"),
        frontline("black"),
        Array(8).fill(null, 0, 8),
        Array(8).fill(null, 0, 8),
        Array(8).fill(null, 0, 8),
        Array(8).fill(null, 0, 8),
        frontline("white"),
        backline("white")
    ];

    turn:number = 1;
    move:"black"|"white" = "white";
    casualties:ChessPiece[] = [];

    getPiece(location:Coordinate):ChessPiece | null {
        return this.layout[location.y][location.x]
    }

    movePiece(piece:Coordinate, target:Coordinate) {
        let pieceRef = this.layout[piece.y][piece.x];
        if (pieceRef === null) return;

        if(this.layout[target.y][target.x] !== null)
            this.casualties.push(<ChessPiece>(this.layout[target.y][target.x])); 

        this.layout[target.y][target.x] = pieceRef;
        this.layout[piece.y][piece.x] = null;
        
        pieceRef.moves++;

        this.turn++;
        this.move = pieceRef.side==="white"?"black":"white";
    }

    getNumPossibleMoves(side:"black"|"white") {
        let count = 0;

        for(let y=0;y<this.layout.length;y++){
            for(let x=0;x<this.layout[y].length;x++){
                let piece = this.layout[y][x];
                if(piece === null || piece.side !== side) continue;
                
                count += piece.getMobility(this.layout).length;
            }
        }

        return count;
    }
}

export function isInCheck(layout:(ChessPiece|null)[][], side:"black"|"white") {
    let king:ChessPiece|undefined = undefined;

    $:for(let y=0;y<layout.length;y++) {
        for(let x=0;x<layout[y].length;x++) {
            if(layout[y][x]?.side===side&&layout[y][x]?.name==="king") {
                king = <ChessPiece>layout[y][x];
                break $;
            }
        }
    }

    if(!king) return true;

    let pos = king.getPosition(layout);
    let attacked = getAttackedSpaces(layout, side);
    
    for(let i=0;i<attacked.length;i++) {
        if(attacked[i].x===pos.x&&attacked[i].y===pos.y)
            return true;
    }

    return false;
}

function getAttackedSpaces(layout:(ChessPiece|null)[][], side:"black"|"white") {
    let attacked:Coordinate[] = [];

    for(let y=0;y<layout.length;y++) {
        for(let x=0;x<layout[y].length;x++) {
            let space = layout[y][x];
            if(space===null || space.side===side) continue;

            attacked.push(...space.getMobility(layout, false, false));
        }
    }

    return attacked;
}