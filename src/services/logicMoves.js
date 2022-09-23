import { position_pieces, selected_piece_object, possible_moves_object, update_store, promotion_modal_object, modifiers } from '../store/index'
import { renderBoard } from '../components/board.svelte'
import { findPossibleMoves, getMoves } from '../services/piecesRules'
import { table_pieces } from '../helpers/constants'
import { pieces } from '../helpers/utils'
import { kingInXeque } from './safeKing'
import { renderPromotionInterface, renderMateInterface } from './interface'

const movesToPosition = moves => {
    let possibleMovesList
    let newPossibleMovesList = []
    possibleMovesList = moves.split(' ')
    possibleMovesList.shift()
    possibleMovesList.forEach(it => {
        newPossibleMovesList.push({row: it.charAt(3), col: it.charAt(4)})
    })
    return newPossibleMovesList
}

const selectSourcePiece = position => {
    const {row, col} = position
    const { row: s_row, col: s_col } = selected_piece_object.selected_piece_
    const { white_turn, white_player } = modifiers.game_settings_
    const { xeque_mate_ } = modifiers
    let possibleMovesList 

    if(white_player == white_turn && (xeque_mate_ == null)) {
        if(s_row == row && s_col == col) { // selected the same piece
            update_store(selected_piece_object.selected_piece, {})
            update_store(possible_moves_object.possible_moves, [])
            renderBoard(selected_piece_object.selected_piece_, [], selected_piece_object.last_piece_moved_, selected_piece_object.king_xeque_)
        }else { // selected new piece
            const moves = getMoves(position_pieces[row][col], position_pieces, position, '')
            console.log('POSSIBLE MOVES: ',moves)
            modifiers.game_historic_.forEach((it, idx) => console.log(`${idx+1} ${it.sts.move}`))
            possibleMovesList = movesToPosition(moves)
            if(possibleMovesList.length > 0) {
                update_store(selected_piece_object.selected_piece, {row, col})
                update_store(possible_moves_object.possible_moves, moves)
                renderBoard(selected_piece_object.selected_piece_, possibleMovesList, selected_piece_object.last_piece_moved_, selected_piece_object.king_xeque_)
            }
            
        }
    }
}

const selectTargetPiece = target => {
    const {row: t_row, col: t_col} = target
    const { row: s_row, col: s_col } = selected_piece_object.selected_piece_

    if(possible_moves_object.possible_moves_ != '' || selected_piece_object.selected_piece_.row) {
        const list_moves = possible_moves_object.possible_moves_.split(' ')
        const get_move = list_moves.filter(it => it.includes(`${s_row}${s_col}${t_row}${t_col}`))
        if(get_move.length == 1) { // normal option
            beforeMakeMove(get_move)
        }else if(get_move.length > 2) { // promotion option
            renderPromotionInterface(get_move)
        }else {
            console.log('invalid move')
            renderBoard(null, [], selected_piece_object.last_piece_moved_, selected_piece_object.king_xeque_)
        }
    
    }else {
        console.log('select a piece')
    }
    
    update_store(selected_piece_object.selected_piece, {})
    update_store(possible_moves_object.possible_moves, [])
}

const selectPromotionPiece = (piece) => {
    update_store(promotion_modal_object.promotion_modal, false)
    beforeMakeMove([piece])
}

const beforeMakeMove = move => {
    makeMove(move)
    setTimeout(() => {
        make_engine_moves()
        check_white_game()
    }, 500);
}

const makeMove = command => {
    const { xeque_mate_ } = modifiers
    const { rook, king, pawn } = table_pieces().pieces
    const { white_turn } = modifiers.game_settings_
    const { dinamicRules: { kingCastle, kingTarget } } = pieces()
    
    let piece 
    let source
    let target
    let en_passant = null
    let modifier_pieces = command[0].charAt(0)
    
    /*
        commands structure

        p1231Q, b4333R capture
        p1243, b2344 move
        ^1234qB promotion capture
        ^1244q promotion move
        ,3344 cria en-passant
        ;2344 consome en-passant
        -3244 castle k
        _2344 castle q
    */

    if(xeque_mate_ == null) {
        if(modifier_pieces == '^') { // promotion option
            const promotionPiece = command[0].charAt(5)
            source = command[0].slice(command[0].length-5, command[0].length-3) 
            target = command[0].slice(command[0].length-3, command[0].length-1) 
            
            position_pieces[command[0].charAt(1)][command[0].charAt(2)] = ' '
            position_pieces[command[0].charAt(3)][command[0].charAt(4)] = promotionPiece
        }else if(['-','_'].includes(modifier_pieces)) { // castle option
            source = command[0].slice(command[0].length-4, command[0].length-2) 
            target = command[0].slice(command[0].length-2, command[0].length)

            position_pieces[source.charAt(0)][source.charAt(1)] = ' '
            position_pieces[target.charAt(0)][target.charAt(1)] = king
            if(target == kingTarget) {
                position_pieces[kingCastle][7] = ' '
                position_pieces[target.charAt(0)][parseInt(target.charAt(1))-1] = rook
            }else {
                position_pieces[kingCastle][0] = ' '
                position_pieces[target.charAt(0)][parseInt(target.charAt(1))+1] = rook
            }
        }else if([',',';'].includes(modifier_pieces)) {
            source = command[0].slice(command[0].length-4, command[0].length-2) 
            target = command[0].slice(command[0].length-2, command[0].length)

            if(modifier_pieces == ';'){
                position_pieces[source.charAt(0)][source.charAt(1)] = ' '
                position_pieces[source.charAt(0)][target.charAt(1)] = ' ' // delete en passant piece
                position_pieces[target.charAt(0)][target.charAt(1)] = pawn
            }else if(modifier_pieces == ',') {
                en_passant = parseInt(target.charAt(1))
                position_pieces[source.charAt(0)][source.charAt(1)] = ' '
                position_pieces[target.charAt(0)][target.charAt(1)] = pawn
            }
        }else {
            piece = command[0].charAt(0)
            position_pieces[command[0].charAt(1)][command[0].charAt(2)] = ' '
            position_pieces[command[0].charAt(3)][command[0].charAt(4)] = piece
            source = command[0].slice(1,3)
            // castle_modifiers(piece, source, white_turn) // after move add modifiers
        }
        
        afterMakeMove(command, modifier_pieces, piece, source, en_passant)
    }
}

const undoMove = () => {
    let command = null
    const newHistoric = modifiers.game_historic_

    for(let i=0;i<newHistoric.length;i++){
        console.log(newHistoric[i])
        if(newHistoric[i].head) {   
            newHistoric[i].head = false
            if(i > 0) newHistoric[i-1].head = true
            command = newHistoric[i].sts.move
        }
    }

    if(command) {
        let piece = command.charAt(0)
        position_pieces[command.charAt(1)][command.charAt(2)] = piece
        position_pieces[command.charAt(3)][command.charAt(4)] = ' '
    }
    
    renderBoard()
}

const afterMakeMove = (command, modifier_pieces, piece, source, en_passant=null) => {
    const { white_turn, white_player } = modifiers.game_settings_
    let castle_status = castle_modifiers(piece, source, modifier_pieces)

    
    if(modifiers.game_historic_.length > 0) {
        const newHistoric = modifiers.game_historic_
        newHistoric[newHistoric.length-1].head = false
    
        update_store(modifiers.game_historic, newHistoric)
    }
   
    update_store(modifiers.game_settings, {white_turn: !white_turn, white_player}) // change the turn player
    checkInsufficientMaterial() 
    const xeque = kingInXeque(position_pieces)
    update_store(selected_piece_object.king_xeque, xeque ? (white_turn ? 'K' : 'k') : null) // mark enemy king xeque
    update_store(selected_piece_object.last_piece_moved, {ini: command[0].substr(1,2), fin: command[0].substr(3,2)})

    update_store(modifiers.game_historic, [...modifiers.game_historic_, {head: true, sts: {move: command[0], castle: castle_status, en_passant}}])
    renderBoard(null, [], selected_piece_object.last_piece_moved_, selected_piece_object.king_xeque_)
    // console.log(!nodes)
    // if(playerTurn) {
    // }
}

const checkInsufficientMaterial = () => {
    const pieces = new RegExp(/[pPrRqQ]/)
    const knights = new RegExp(/[nN]/)
    const bishop = new RegExp(/[bB]/)

    const drawPieces = {n: 0, wb: 0, bb: 0, N: 0, wB: 0, bB: 0}

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
   
    return renderMateInterface(0)
}

const make_engine_moves = () => {
    const { white_player, white_turn } = modifiers.game_settings_
    const { deep, nodes } = modifiers.engine_settings_
    const isEngineTurn = (white_player !== white_turn)

    if(isEngineTurn) {
        const better_move = findPossibleMoves(isEngineTurn) // engine plays
        if(better_move) makeMove([better_move])
    }
}

const check_white_game = () => {
    const {white_player, white_turn} = modifiers.game_settings_
    const isPlayerTurn = (white_player !== white_turn)
    const { xeque_mate_ } = modifiers

    if(xeque_mate_ == null) findPossibleMoves(isPlayerTurn) // player plays
}

const castle_modifiers = (piece, source, modifier_pieces) => { // modify castles
    let lastMove =  modifiers.game_historic_[modifiers.game_historic_.length-2]
    let hitoricLength = modifiers.game_historic_.length >= 2
    let castle_status = hitoricLength ? 
    {castle_k: lastMove.sts.castle.castle_k, castle_q: lastMove.sts.castle.castle_q} :
    {castle_k: true, castle_q: true}

    if(['k','K'].includes(piece) || ['-','_'].includes(modifier_pieces)) {
        castle_status = {castle_k: false, castle_q: false}
    }
    if(['r','R'].includes(piece)) {
        if(['00','70'].includes(source)) {
            castle_status = hitoricLength ? 
            {castle_k: lastMove.sts.castle.castle_k, castle_q: false} : 
            {castle_k: true, castle_q: false}
        }else if(['07','77'].includes(source)) {
            castle_status = hitoricLength ? 
            {castle_k: false, castle_q: lastMove.sts.castle.castle_q} : 
            {castle_k: false, castle_q: true}
        }
    }
    return castle_status
}

  export {
      selectSourcePiece,
      selectTargetPiece,
      selectPromotionPiece,
      undoMove
  }