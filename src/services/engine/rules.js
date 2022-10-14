import { modifiers } from "../../store"
const insufficientMaterial = (position_pieces) => {
    const pieces = new RegExp(/[pPrRqQ]/)
    const knights = new RegExp(/[nN]/)
    const bishop = new RegExp(/[bB]/)

    const drawPieces = {n: 0, wb: 0, bb: 0, N: 0, wB: 0, bB: 0}

    if(modifiers.game_historic_.length < 40) return false 

    for(let row=0;row<=7;row++)
    for(let col=0;col<=7;col++) {
        if(pieces.test(position_pieces[row][col])) return false
        if(knights.test(position_pieces[row][col])) {
            drawPieces[position_pieces[row][col]] ++
        }
        if(bishop.test(position_pieces[row][col])) {
            !((row+col)%2) ? drawPieces[`w${position_pieces[row][col]}`]++ : drawPieces[`b${position_pieces[row][col]}`]++
        }
    }
    if((!!(drawPieces.wb && drawPieces.bb) || !!((drawPieces.wb | drawPieces.bb) && drawPieces.n)) || !!(drawPieces.n > 2)) return false
    if((!!(drawPieces.wB && drawPieces.bB) || !!((drawPieces.wB | drawPieces.bB) && drawPieces.N)) || !!(drawPieces.N > 2)) return false
    
    return true
}

export {
    insufficientMaterial
}