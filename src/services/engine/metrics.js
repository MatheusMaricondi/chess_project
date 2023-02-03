import { table_pieces } from "../../helpers/constants"

const lineAnalise = snapshot => {
    let result = 0
    result += piecesValue(snapshot)
    return result
}

const piecesValue = snapshot => {
    const { pieces, target } = table_pieces()
    let value = 0

    for(let row=0;row<=7;row++) {
        for(let col=0;col<=7;col++) {
            switch(snapshot[row][col]) {
                case pieces.pawn.toUpperCase(): value = piecesPawnRules(value, {row, col});break;
                case pieces.rook.toUpperCase(): value -= 5;break;
                case pieces.knight.toUpperCase(): value -= 3;break;
                case pieces.bishop.toUpperCase(): value -= 3.2;break;
                case pieces.queen.toUpperCase(): value -= 9;break;
                case target.pawn.toLowerCase(): value = targetPawnRules(value, {row, col});break;
                case target.rook.toLowerCase(): value += 5;break;
                case target.knight.toLowerCase(): value += 3;break;
                case target.bishop.toLowerCase(): value += 3.2;break;
                case target.queen.toLowerCase(): value += 9;break;
            }
        }
    }

    return parseFloat(value.toFixed(2))
}


const piecesPawnRules = (value, position) => {
    const {row, col} = position
    value += 1.0
    const pawnPosition = [
        [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00],
        [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00],
        [0.00,0.01,0.01,0.02,0.02,0.00,0.01,0.00],
        [0.01,0.01,0.02,0.03,0.03,0.02,0.01,0.01],
        [0.02,0.02,0.03,0.04,0.04,0.03,0.02,0.02],
        [0.03,0.03,0.04,0.05,0.05,0.04,0.03,0.03],
        [0.04,0.04,0.05,0.06,0.06,0.05,0.04,0.04],
        [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00]
    ]
    value += pawnPosition[row][col]
    
    return value
}

const targetPawnRules = (value, position) => {
    const {row, col} = position
    value += 1.0
    const pawnPosition = [
        [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00],
        [0.04,0.04,0.05,0.06,0.06,0.05,0.04,0.04],
        [0.03,0.03,0.04,0.05,0.05,0.04,0.03,0.03],
        [0.02,0.02,0.03,0.04,0.04,0.03,0.02,0.02],
        [0.01,0.01,0.02,0.03,0.03,0.02,0.01,0.01],
        [0.00,0.01,0.01,0.02,0.02,0.00,0.01,0.00],
        [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00],
        [0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00]
    ]
    value += pawnPosition[row][col]
    
    return value
}

export default lineAnalise