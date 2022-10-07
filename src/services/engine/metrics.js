import { table_pieces } from "../../helpers/constants"

const lineAnalise = snapshot => {
    let result = 0
    result = piecesValue(snapshot)
    return result
}

const piecesValue = snapshot => {
    const {pieces, target} = table_pieces()
    let value = 0
    console.log(pieces.pawn)
    for(let row=0;row<=7;row++) {
        for(let col=0;col<=7;col++) {
            switch(snapshot[row][col]) {
                case pieces.pawn: value += 1;break;
                case pieces.rook: value += 5;break;
                case pieces.knight: value += 3;break;
                case pieces.bishop: value += 3.2;break;
                case pieces.queen: value += 9;break;
                case target.pawn: value -= 1;break;
                case target.rook: value -= 5;break;
                case target.knight: value -= 3;break;
                case target.bishop: value -= 3.2;break;
                case target.queen: value -= 9;break;
            }
        }
    }
    return value
}

export default lineAnalise