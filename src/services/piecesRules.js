import { position_pieces, modifiers } from '../store/index'
import { pieces } from '../helpers/utils'
import { safeKing } from './safeKing'
import { table_pieces } from '../helpers/constants'
import Tree from './engine/treeAlgorithm'

const findPossibleMoves = () => {
    console.time('engine')
    const engineTree = new Tree()
    engineTree.startEngine()
    console.timeEnd('engine')
    console.log('Tree: ',engineTree,' Deep ',modifiers.engine_settings_.globalDeep)
    return engineTree.command

}



const getMoves = (value, snapshot, position, moves) => {
    const { pawn, rook, knight, bishop, queen, king} = table_pieces().pieces

    switch(value) {
        case pawn: moves += pawnMoves(value, position, snapshot); break;
        case knight: moves += knightMoves(value, position, snapshot); break;
        case rook: moves += rookMoves(value, position, snapshot); break;
        case bishop: moves += bishopMoves(value, position, snapshot); break;
        case queen: moves += queenMoves(value, position, snapshot); break;
        case king: moves += kingMoves(value, position, snapshot); break;
    }
    return moves
}

const createMove = (moves, value, old_position, new_position, target='', game_modifiers=null) => {
    switch(game_modifiers) { // 1=promotion; 2=catles; 3=en_passant
        case 1: moves = pawnPromotion(moves, value, old_position, new_position, target);break;
        case 2: moves = castles(moves, value, old_position, new_position);break;
        case 3: case 4: moves = enPassant(moves, value, old_position, new_position, game_modifiers);break;
        default: moves = defaultMove(moves, value, old_position, new_position, target);break;
    }  
    return moves
}

const defaultMove = (moves, value, old_position, new_position, target) => {
    const {old_row,old_col} = old_position
    const {new_row,new_col} = new_position
    let isSafe = safeKing(value, old_position, new_position, position_pieces)

    if(isSafe) moves += ` ${value}${old_row}${old_col}${new_row}${new_col}${target}`
    return moves
}

const pawnPromotion = (moves, value, old_position, new_position, target) => {
    const { rook, knight, bishop, queen } = table_pieces().pieces

    const {old_row,old_col} = old_position
    const {new_row,new_col} = new_position
    const promotion_pieces = [knight,rook,bishop,queen]
    
    let isSafe = safeKing(value, old_position, new_position, position_pieces)

    if(isSafe)
        promotion_pieces.forEach(piece => moves += ` ^${old_row}${old_col}${new_row}${new_col}${piece}${target}`)    
        
    return moves
}

const castles = (moves, value, old_position, new_position) => {
    const {old_row, old_col} = old_position
    const {new_row, new_col} = new_position
    let isSafeQueen = true
    let isSafeKing = true
    let lastMove = null

    if(modifiers.game_historic_.length > 2) {
        lastMove = modifiers.game_historic_[modifiers.game_historic_.length-2]
    }
    const kingCastle = lastMove ?  lastMove.sts.castle.castle_k : true
    const queenCastle = lastMove ?  lastMove.sts.castle.castle_q : true

    const validate_check_position = safeKing(value, old_position, new_position, position_pieces)
    
    if(validate_check_position) {
        for(let i=1;i<=2;i++) {
            if(position_pieces[new_row][new_col+i] == ' ') {
                if(isSafeKing) isSafeKing = safeKing(value, old_position, {new_row, new_col: old_col+i}, position_pieces)
            }else {
                isSafeKing = false
            }
            if(position_pieces[new_row][new_col-i] == ' ') {
                if(isSafeQueen) isSafeQueen = safeKing(value, old_position, {new_row, new_col: old_col-i}, position_pieces)
            }else {
                isSafeQueen = false
            }
        }
        if(kingCastle && isSafeKing) {
            moves += ` -${old_row}${old_col}${new_row}${new_col+2}`
        }
        if(queenCastle && isSafeQueen) {
            moves += ` _${old_row}${old_col}${new_row}${new_col-2}`
        }
    }
    return moves
}

const enPassant = (moves, value, old_position, new_position, type) => {
    const {old_row, old_col} = old_position
    const {new_row, new_col} = new_position
    let isSafe 

        if(type == 3) { // consumir en-passant
            isSafe = safeKing(value, old_position, new_position, position_pieces, true)
            if(isSafe) moves += ` ;${old_row}${old_col}${new_row}${new_col}`
        }else { // criar en-passant
            isSafe = safeKing(value, old_position, new_position, position_pieces)
            if(isSafe) moves += ` ,${old_row}${old_col}${new_row}${new_col}`
        }
    
    return moves
}

const pawnMoves = (value, position, snapshot) => {
    const { row, col } = position
    const { static_pieces, target_pieces, dinamicRules: { pawnDirection, pawnStart, pawnPromotion, pawnEnPassant } } = pieces()
    const promotion = 1
    const en_passant = [3,4] // 3 - consume, 4 - create
    let moves = ''
    const { pawn } = table_pieces().target

    if(pawnDirection == 1) {
        for(let col_ = col+pawnDirection; col_ >= (col-pawnDirection); col_-=pawnDirection) {
            let first_move = (row == pawnStart && col_ == col) ? pawnDirection+pawnDirection : pawnDirection
            for(let row_ = row+pawnDirection; row_ <= (row+first_move); row_+=pawnDirection) {
                if((col_ != col) && ![-1,8].includes(col_)) { // capture
                    if(row == pawnPromotion && target_pieces.test(snapshot[row_][col_])) { // promotion capture
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, snapshot[row_][col_], promotion)
                    }else if(target_pieces.test(snapshot[row_][col_])){ // normal capture 
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, snapshot[row_][col_])
                    }
                }else if(!static_pieces.test(snapshot[row+pawnDirection][col_])) { // move
                    if(row == pawnStart && !static_pieces.test(snapshot[row+pawnDirection][col_]) && !static_pieces.test(snapshot[row_][col_])) { //verifica se o lance se coloca em en-passant
                        if((row_ == row+(pawnDirection+pawnDirection)) && [snapshot[row_][col_-1],snapshot[row_][col_+1]].includes(pawn)) {
                            moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, undefined, en_passant[1])
                        }else {
                            moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_})
                        }
                    }else if(row == pawnPromotion && !static_pieces.test(snapshot[row_][col_])) { // promotion move
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, undefined, promotion)
                    }else if((pawnPromotion !=row) && !static_pieces.test(snapshot[row_][col_])) { // all another moves
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_})
                    }
                }
            }
        }
    }else {
        for(let col_ = col+pawnDirection; col_ <= (col-pawnDirection); col_-=pawnDirection) {
            let first_move = (row == pawnStart && col_ == col) ? pawnDirection+pawnDirection : pawnDirection
            for(let row_ = row+pawnDirection; row_ >= (row+first_move); row_+=pawnDirection) { 
                if((col_ != col) && ![-1,8].includes(col_)) { // capture
                    if(row == pawnPromotion && target_pieces.test(snapshot[row_][col_])) { // promotion capture
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, snapshot[row_][col_], promotion)
                    }else if(target_pieces.test(snapshot[row_][col_])){ // normal capture 
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, snapshot[row_][col_])
                    }
                }else if(!static_pieces.test(snapshot[row+pawnDirection][col_])){ // move
                    if(row == pawnStart && !static_pieces.test(snapshot[row+pawnDirection][col_]) && !static_pieces.test(snapshot[row_][col_])) { //verifica se o lance se coloca em en-passant
                        if((row_ == row+(pawnDirection+pawnDirection)) && [snapshot[row_][col_-1],snapshot[row_][col_+1]].includes(pawn)) {
                            moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, undefined, en_passant[1])
                        }else {
                            moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_})
                        }
                    }else if(row == pawnPromotion && !static_pieces.test(snapshot[row_][col_])) { // promotion move
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, undefined, promotion)
                    }else if((pawnPromotion !=row) && !static_pieces.test(snapshot[row_][col_])) { // all another moves
                        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_})
                    }
                }
            }
        }
       
    }
    if(row == pawnEnPassant) {
        let lastEnPassant 
        if(modifiers.game_historic_.length > 0) {
           lastEnPassant = modifiers.game_historic_[modifiers.game_historic_.length-1].sts.en_passant
        }

        if(lastEnPassant == (col-1)) 
            moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row+pawnDirection, new_col: col-1}, null, en_passant[0])
        else if(lastEnPassant == (col+1))
            moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row+pawnDirection, new_col: col+1}, null, en_passant[0])
    }
    return moves
}

const knightMoves = (value, position, snapshot) => {
    const { row, col } = position
    const { same_pieces, target_pieces } = pieces()
    let moves = ''

    for(let r=row-2; r<=row+2; r++) {
        for(let c=col-2; c<=col+2; c++) {

            if((r>=0 && r<=7) && (c>=0 && c<=7))
            if((r-row)/(c-col) != 1 && (r-row)/(c-col) != -1 && (r!=row && c!=col)) {

                if(!same_pieces.test(snapshot[r][c])) {
                    moves = target_pieces.test(snapshot[r][c]) ? 
                    createMove(moves, value, {old_row: row, old_col: col}, {new_row: r, new_col: c}, snapshot[r][c]) : 
                    createMove(moves, value, {old_row: row, old_col: col}, {new_row: r, new_col: c})
                }
            }
        }
    }
    return moves
}

const rookMoves = (value, position, snapshot, isKing=false) => {
    const { row, col } = position
    const { same_pieces, target_pieces } = pieces()
    let moves = ''
    for(let i=-3;i<=3;i+=2) {
        let static_direction = (i<0) ? row : col
        let direction = (i%2 == 1) ? row : col
        let indice = Math.abs(i) == 3 ? 1 : -1 
        
        for(let d=direction;![-1,8].includes(d);d+=indice) {
            let [row_, col_] = (i<0) ? [static_direction, d] : [d, static_direction]
            
            if((row_!=row) || (col_!=col)) {
                if(target_pieces.test(snapshot[row_][col_])) {
                    moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, snapshot[row_][col_])
                    break;
                }else if(same_pieces.test(snapshot[row_][col_])) {
                    break;
                }else {
                    moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_})
                    if(isKing) break;
                }
            }
        }
    }

    return moves
}

const bishopMoves = (value, position, snapshot, isKing=false) => {
    const { row, col } = position
    const { same_pieces, target_pieces } = pieces()
    let moves = ''

    for(let i=-3; i<=3; i+=2) {
        for(let row_=row+(i%2), col_=col+(i+((i%2)*-2)); (![-1,8].includes(row_) && ![-1,8].includes(col_)); row_+=(i%2), col_+=(i+((i%2)*-2)) ) {
            if(same_pieces.test(snapshot[row_][col_])) {
                break;
            }else if(target_pieces.test(snapshot[row_][col_])) {
                moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_}, snapshot[row_][col_])
                break;
            }else {
                moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row_, new_col: col_})
                if(isKing) break;
            }
        }
    }
    return moves
}

const queenMoves = (value, position, snapshot) => {
    let moves = ''

    moves += rookMoves(value, position, snapshot)
    moves += bishopMoves(value, position, snapshot)

    return moves
}

const kingMoves = (value, position, snapshot) => {
    let moves = ''
    moves += rookMoves(value, position, snapshot, true)
    moves += bishopMoves(value, position, snapshot, true)
    moves += castleMoves(value, position)
  
    return moves
}

const castleMoves = (value, position) => {
    const {row, col} = position
    const castle_row = pieces().dinamicRules.kingCastle
    let moves = ''
    const castle = 2
    if(row == castle_row && col == 4) {
        moves = createMove(moves, value, {old_row: row, old_col: col}, {new_row: row, new_col: col}, undefined, castle)
    }
    return moves
}

export {
    findPossibleMoves,
    getMoves
}
