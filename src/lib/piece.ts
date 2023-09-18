import { isInCheck } from "./game";
import { MovePath } from "./movement";

type StandardPiece = "pawn"|"knight"|"bishop"|"rook"|"queen"|"king";

export class ChessPiece {
    static count = 0;

    name:string;
    iconPath:string;
    side:"black"|"white";
    material:number;

    private mobility:MovePath[] = [];

    moves:number = 0;

    key:number;

    constructor(name:StandardPiece, side:"black"|"white") {
        this.key = ChessPiece.count;
        ChessPiece.count++;

        this.name = name;
        this.side = side;

        this.mobility = [];
        standardMovement[name].forEach(item=>{
            this.mobility.push({...item})
        })

        this.material = standardValues[name];

        this.iconPath = `/icons/pieces/${this.side}/${this.name}.svg`;
    }

    getPosition(layout:(ChessPiece|null)[][]):Coordinate {
        for(let i=0;i<layout.length;i++) {
            if(layout[i].indexOf(this) >= 0)
                return {x: layout[i].indexOf(this), y: i};
        }

        throw new Error("Unexpected reference to dead piece");
    }

    getMobility(layout:(ChessPiece|null)[][], reverse:boolean = false, checkForCheck:boolean = true) {
        if(reverse) {
            let reversed:(ChessPiece|null)[][] = [];
            for(let i=layout.length-1;i>=0;i--) {
                reversed.push([...layout[i]].reverse())
            }
            layout = reversed;
        }

        let output:Coordinate[] = [];
        let pos = this.getPosition(layout);

        // Slightly hacky, should handle this better when implementing other special movement rules
        if(this.name === "pawn") {
            if(this.moves === 0)
                this.mobility[0].length = 2;
            else
                this.mobility[0].length = 1;
        }


        this.mobility.forEach(path => {
            let iter = {
                x: pos.x + path.x,
                y: pos.y + path.y
            }

            let count = 0;

            while(
                iter.y >= 0 && iter.y < layout.length && 
                iter.x >= 0 && iter.x < layout[iter.y].length &&
                count < path.length
            ) {
                let target = layout[iter.y][iter.x];

                if(target === null) {
                    if(path.canCapture !== "only")
                        output.push({...iter});
                } else{
                    if(target.side !== this.side && path.canCapture !== "no") {
                        output.push({...iter})
                    }
                    break;
                }

                count++;
                iter.x += path.x;
                iter.y += path.y;
            }
        });

        if(checkForCheck) {
            // Remove moves that would result in check
            for(let i=0;i<output.length;i++){
                let move = output[i];
                let forecast:(ChessPiece|null)[][] = [];
                layout.forEach(l=>{
                    forecast.push([...l])
                })
        
                forecast[move.y][move.x] = this;
                forecast[pos.y][pos.x] = null;

                if(isInCheck(forecast, this.side)) {
                    output.splice(i, 1)
                    i--;
                }
            }
        }

        if(reverse) {
            output.forEach(item=>{
                item.y = layout.length - 1 - item.y;
                item.x = layout[item.y].length - 1 - item.x;
            })
        }

        return output;
    }
}

const standardValues:{[index:string]:number} = {
    pawn:1,
    knight:3,
    bishop:3,
    rook:5,
    queen:9,
    king:0
}

const standardMovement:{[index:string]:MovePath[]} = {
    pawn: [
        {x: 0, y: -1, length:1, canCapture: "no"},
        {x: -1, y: -1, length:1, canCapture: "only"},
        {x: 1, y: -1, length:1, canCapture: "only"},
    ],

    bishop: [
        {x: -1, y: 1, length:Infinity, canCapture: "yes"},
        {x: -1, y: -1, length:Infinity, canCapture: "yes"},
        {x: 1, y: -1, length:Infinity, canCapture: "yes"},
        {x: 1, y: 1, length:Infinity, canCapture: "yes"},
    ],

    knight: [
        {x: -1, y: 2, length:1, canCapture: "yes"},
        {x: -2, y: 1, length:1, canCapture: "yes"},
        {x: -1, y: -2, length:1, canCapture: "yes"},
        {x: -2, y: -1, length:1, canCapture: "yes"},
        {x: 1, y: -2, length:1, canCapture: "yes"},
        {x: 2, y: -1, length:1, canCapture: "yes"},
        {x: 1, y: 2, length:1, canCapture: "yes"},
        {x: 2, y: 1, length:1, canCapture: "yes"},
    ],

    rook: [
        {x: -1, y: 0, length:Infinity, canCapture: "yes"},
        {x: 0, y: -1, length:Infinity, canCapture: "yes"},
        {x: 1, y: 0, length:Infinity, canCapture: "yes"},
        {x: 0, y: 1, length:Infinity, canCapture: "yes"},
    ],

    queen: [
        {x: -1, y: 0, length:Infinity, canCapture: "yes"},
        {x: 0, y: -1, length:Infinity, canCapture: "yes"},
        {x: 1, y: 0, length:Infinity, canCapture: "yes"},
        {x: 0, y: 1, length:Infinity, canCapture: "yes"},
        {x: -1, y: 1, length:Infinity, canCapture: "yes"},
        {x: -1, y: -1, length:Infinity, canCapture: "yes"},
        {x: 1, y: -1, length:Infinity, canCapture: "yes"},
        {x: 1, y: 1, length:Infinity, canCapture: "yes"},
    ], 

    king: [
        {x: -1, y: 0, length:1, canCapture: "yes"},
        {x: 0, y: -1, length:1, canCapture: "yes"},
        {x: 1, y: 0, length:1, canCapture: "yes"},
        {x: 0, y: 1, length:1, canCapture: "yes"},
        {x: -1, y: 1, length:1, canCapture: "yes"},
        {x: -1, y: -1, length:1, canCapture: "yes"},
        {x: 1, y: -1, length:1, canCapture: "yes"},
        {x: 1, y: 1, length:1, canCapture: "yes"},
    ], 
}


export function backline(side:"black"|"white") {
    return [
        new ChessPiece("rook", side),
        new ChessPiece("knight", side),
        new ChessPiece("bishop", side),
        new ChessPiece("queen", side),
        new ChessPiece("king", side),
        new ChessPiece("bishop", side),
        new ChessPiece("knight", side),
        new ChessPiece("rook", side),
    ]
}

export function frontline(side:"black"|"white") {
    return [
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
        new ChessPiece("pawn", side),
    ]
}