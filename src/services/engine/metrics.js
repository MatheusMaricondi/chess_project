import { table_pieces } from "../../helpers/constants"

const lineAnalise = snapshot => {
    let result = 0
    result = piecesValue(snapshot)
    return result
}

const piecesValue = (snapshot) => {
    const { pieces, target } = table_pieces()
    let value = 0

    for(let row=0;row<=7;row++) {
        for(let col=0;col<=7;col++) {
            switch(snapshot[row][col]) {
                case pieces.pawn.toUpperCase(): value -= 1;break;
                case pieces.rook.toUpperCase(): value -= 5;break;
                case pieces.knight.toUpperCase(): value -= 3;break;
                case pieces.bishop.toUpperCase(): value -= 3.2;break;
                case pieces.queen.toUpperCase(): value -= 9;break;
                case target.pawn.toLowerCase(): value += 1;break;
                case target.rook.toLowerCase(): value += 5;break;
                case target.knight.toLowerCase(): value += 3;break;
                case target.bishop.toLowerCase(): value += 3.2;break;
                case target.queen.toLowerCase(): value += 9;break;
            }
        }
    }
    return value.toFixed(2)
}

export default lineAnalise