import { position_pieces } from  '../store/index'
import { pieces } from '../helpers/utils'
import { table_pieces } from '../helpers/constants'


const kingInXeque = (snapshot) => {
    const kingInXeque = !checkPiecesAround(snapshot) 
    return kingInXeque
}

const safeKing = (piece, old_position, new_position, snapshot) => {
    const { old_row, old_col } = old_position
    const { new_row, new_col } = new_position
    let old_square = snapshot[new_row][new_col]
    let kingSafe

    //make move
    snapshot[old_row][old_col] = ' '
    snapshot[new_row][new_col] = piece
    
    kingSafe = checkPiecesAround(snapshot) // true = safe
    // undo move
    snapshot[old_row][old_col] = piece
    snapshot[new_row][new_col] = old_square

    return kingSafe
}

const checkPiecesAround = snapshot => {
    const { king } = table_pieces().pieces
    let returnSafes

    snapshot.forEach((row, row_i) => {
        row.forEach((col, col_i) => {
            if(position_pieces[row_i][col_i] == king) {
                returnSafes = withoutRooks({row: row_i, col: col_i}, position_pieces) && withoutBishops({row: row_i, col: col_i}, position_pieces) && withoutKnights({row: row_i, col: col_i}, position_pieces) && withoutPawn({row: row_i, col: col_i}, position_pieces)   
            }
        })
    });

    return returnSafes
}


const withoutRooks = (position, snapshot) => {
    const {row, col} = position
    const { target_pieces, same_pieces } = pieces()
    const { rook, queen, king } = table_pieces().target

    for(let i=-3;i<=3;i+=2) {
        let static_direction = (i<0) ? row : col
        let direction = (i%2 == 1) ? row : col
        let indice = Math.abs(i) == 3 ? 1 : -1 
      
        for(let d=direction;![-1,8].includes(d);d+=indice) {
            let [row_, col_] = (i<0) ? [static_direction, d] : [d, static_direction]

            if((row_!=row) || (col_!=col)) {
                if(target_pieces.test(snapshot[row_][col_])) {
                    if(([rook,queen].includes(snapshot[row_][col_])) || ([king].includes(snapshot[row_][col_]) && (row_-1 == row || row_+1 == row || col_-1 == col || col_+1 == col))) return false
                    break;
                }else if(same_pieces.test(snapshot[row_][col_])) {
                    break;
                }
            }
        }
    }
    return true
}


const withoutBishops = (position, snapshot) => {
    const { row, col } = position
    const { same_pieces, target_pieces } = pieces()
    const { bishop, queen, king } = table_pieces().target

    for(let i=-3; i<=3; i+=2) {
        for(let row_=row+(i%2), col_=col+(i+((i%2)*-2)); (![-1,8].includes(row_) && ![-1,8].includes(col_)); row_+=(i%2), col_+=(i+((i%2)*-2)) ) {
            if(same_pieces.test(snapshot[row_][col_])) {
                break;
            }else if(target_pieces.test(snapshot[row_][col_])) {
                if(([bishop,queen].includes(snapshot[row_][col_])) || ((row_-1 == row || row_+1 == row) && [king].includes(snapshot[row_][col_]))) return false
                break;
            }
        }
    }
    return true
}

const withoutKnights = (position, snapshot) => {
    const { row, col } = position
    const { target_pieces } = pieces()
    const { knight } = table_pieces().target

    for(let r=row-2; r<=row+2; r++) {
        for(let c=col-2; c<=col+2; c++) {
            if((r>=0 && r<=7) && (c>=0 && c<=7)) {
                // console.log(`11111 row ${r} col ${c}`)
                if((r-row)/(c-col) != 1 && (r-row)/(c-col) != -1 && (r!=row && c!=col)) {
                    // console.log(`row ${r} col ${c}`)
                    if(target_pieces.test(snapshot[r][c])) {
                        // console.log(r,c, snapshot[r][c],[knight].includes(snapshot[r][c]))
                        if([knight].includes(snapshot[r][c])) return false
                        // break;
                    }
                }
            }
        }
    }
    return true
}

const withoutPawn = (position, snapshot) => {
    const { row, col } = position
    const { pawn } = table_pieces().target
    const { pawnDirection, kingSafePawn } = pieces().dinamicRules

    if(pawnDirection == 1) { 
        if(((row+pawnDirection) <= kingSafePawn) && col+1 <= 7)
            if(snapshot[row+pawnDirection][col+1] == pawn) return false

        if(((row+pawnDirection) <= kingSafePawn) && col-1 >= 0)
            if(snapshot[row+pawnDirection][col-1] == pawn) return false
    }else {
        if(((row+pawnDirection) >= kingSafePawn) && col+1 <= 7)
            if(snapshot[row+pawnDirection][col+1] == pawn) return false

        if(((row+pawnDirection) >= kingSafePawn) && col-1 >= 0)
            if(snapshot[row+pawnDirection][col-1] == pawn) return false
    }

    return true
}

export {
    safeKing,
    kingInXeque
}