import { position_pieces, selected_piece_object, possible_moves_object, update_store, promotion_modal_object, modifiers } from '../store/index'
import { renderBoard } from '../components/board.svelte'
import { findPossibleMoves, getMoves } from '../services/piecesRules'
import { table_pieces } from '../helpers/constants'
import { pieces } from '../helpers/utils'
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
        }else { // selected new piece
            update_store(selected_piece_object.selected_piece, {row, col})
            const moves = getMoves(position_pieces[row][col], position_pieces, position, '')
            possibleMovesList = movesToPosition(moves)
            // console.log('engine move: ',engine_move)
            update_store(possible_moves_object.possible_moves, moves)
        }
        renderBoard(selected_piece_object.selected_piece_,possibleMovesList)
    }
}

const selectTargetPiece = target => {
    const {row: t_row, col: t_col} = target
    const { row: s_row, col: s_col } = selected_piece_object.selected_piece_

    if(possible_moves_object.possible_moves_ != '' || selected_piece_object.selected_piece_ == {}) {
        const list_moves = possible_moves_object.possible_moves_.split(' ')
        const get_move = list_moves.filter(it => it.includes(`${s_row}${s_col}${t_row}${t_col}`))
        if(get_move.length == 1) { // normal option
            beforeMakeMove(get_move)
        }else if(get_move.length == 2) { // igual ao de cima ???
            makeMove(get_move)
        }else if(get_move.length > 2) {
            renderPromotionInterface(get_move)
        }else {
            console.log('invalid move')
        }
    
    }else {
        console.log('select a piece')
    }
    
    update_store(selected_piece_object.selected_piece, {})
    update_store(possible_moves_object.possible_moves, [])
    renderBoard(selected_piece_object.selected_piece_)
}

const beforeMakeMove = move => {
    makeMove(move)
    make_engine_moves()
    check_white_game()
}

const selectPromotionPiece = (piece) => {
    update_store(promotion_modal_object.promotion_modal, false)
    beforeMakeMove([piece])
}

const makeMove = command => {
    const { xeque_mate_ } = modifiers
    const { rook, knight, bishop, queen } = table_pieces().pieces
    const { white_turn, white_player } = modifiers.game_settings_
    const { deep } = modifiers.engine_settings_
    const { dinamicRules: { kingCastle, kingTarget } } = pieces()
    const isPlayerTurn = (white_turn == white_player)

    let piece 
    let source
    let target
    let modifier_pieces = command[0].charAt(5)

    if(xeque_mate_ == null) {
        if([rook,knight,bishop,queen].includes(modifier_pieces)) { // promotion option
            piece = command[0].charAt(0)
            source = command[0].slice(command[0].length-5, command[0].length-3) 
            target = command[0].slice(command[0].length-3, command[0].length-1) 
            
            position_pieces[source.charAt(0)][source.charAt(1)] = ' '
            position_pieces[target.charAt(0)][target.charAt(1)] = modifier_pieces

            managePieces(target, isPlayerTurn, false)
        }else if(['o','O'].includes(modifier_pieces)) { // castle option
            piece = command[0].charAt(0)
            source = command[0].slice(command[0].length-5, command[0].length-3) 
            target = command[0].slice(command[0].length-3, command[0].length-1)

            position_pieces[source.charAt(0)][source.charAt(1)] = ' '
            position_pieces[target.charAt(0)][target.charAt(1)] = piece
            if(target == kingTarget) {
                position_pieces[kingCastle][7] = ' '
                position_pieces[target.charAt(0)][parseInt(target.charAt(1))-1] = rook
            }else {
                position_pieces[kingCastle][0] = ' '
                position_pieces[target.charAt(0)][parseInt(target.charAt(1))+1] = rook
            }
        }else if(['e','c'].includes(modifier_pieces)) {
            piece = command[0].charAt(0)
            source = command[0].slice(command[0].length-5, command[0].length-3) 
            target = command[0].slice(command[0].length-3, command[0].length-1)

            if(modifier_pieces == 'e'){
                position_pieces[source.charAt(0)][source.charAt(1)] = ' '
                position_pieces[source.charAt(0)][target.charAt(1)] = ' ' // delete en passant piece
                position_pieces[target.charAt(0)][target.charAt(1)] = piece
                managePieces(target, isPlayerTurn, true)
            }else if(modifier_pieces == 'c') {
                update_store(modifiers.en_passant, {position: parseInt(target.charAt(1))})
                position_pieces[source.charAt(0)][source.charAt(1)] = ' '
                position_pieces[target.charAt(0)][target.charAt(1)] = piece
            }
        }else {
            piece = command[0].charAt(0)
            source = command[0].slice(command[0].length-4, command[0].length-2) 
            target = command[0].slice(command[0].length-2, command[0].length) 
            managePieces(target, isPlayerTurn, true)
            position_pieces[source.charAt(0)][source.charAt(1)] = ' '
            position_pieces[target.charAt(0)][target.charAt(1)] = piece
            
            castle_modifiers(piece, source, white_turn) // after move add modifiers
        }

        // if(engineAnalyzeOver == deep) {
            if(modifier_pieces != 'c') update_store(modifiers.en_passant, {position: null}) // reset en-passant  
            update_store(modifiers.game_settings, {white_turn: !white_turn, white_player}) // change the turn player
            renderBoard()
        // }
    }
}

const managePieces = (target, player, capt) => {
    const capture =  capt ? -1 : 1
    const { pieces_:{ white, black }, pieces } = modifiers
    let targetPiece = position_pieces[target.charAt(0)][target.charAt(1)]
    let whiteSquare

    if(targetPiece !== ' ' && capt) {
        if(targetPiece == 'b') {
            whiteSquare = !((parseInt(target.charAt(0))+parseInt(target.charAt(1)))%2)
            targetPiece = whiteSquare ? 'wb' : 'bb'
        }else if(targetPiece == 'B') {
            whiteSquare = !((parseInt(target.charAt(0))+parseInt(target.charAt(1)))%2)
            targetPiece = whiteSquare ? 'WB' : 'BB'
        }
        // console.log(player, capt)
        console.log('capture ',capture,' target ',targetPiece,' player? ',player)
        if(player) {
            const newWhite = {...white, [targetPiece]: white[targetPiece]+capture}
            if(!capt) newWhite.p --
            update_store(pieces, {white: newWhite, black})
        }else {
            const newBlack = {...black, [targetPiece]: black[targetPiece]+capture}
            if(!capt) newBlack.P --
            update_store(pieces, {white, black: newBlack})
        }
    }else if(!capt) {
        
    }
    if(insufficientMaterial()) renderMateInterface(0)
}

const insufficientMaterial = () => {
    const { pieces_: {white, black} } = modifiers

    if ((!white.p && !black.P) && (!white.r && !black.R) && (!white.q && !black.Q) && (white.n < 3 && black.N < 3)) {
        if(((!white.wb && !white.bb) || ((!white.wb | !white.bb) && !white.n)) && (!black.WB && !black.BB && !black.N)) return true
        if(((!black.WB && !black.BB) || ((!black.WB | !black.BB) && !black.N)) && (!white.wb && !white.bb && !white.n)) return true
    }
    return false
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

const castle_modifiers = (piece, source, white_turn) => { //modify castles
    if(white_turn) {
        if(piece == 'k') {
            update_store(modifiers.white_castle, {castle_k: false, castle_q: false})
        }else if(piece == 'r' && source == 70) {
            update_store(modifiers.white_castle, {castle_k: modifiers.white_castle_.castle_k, castle_q: false})
        }else if(piece == 'r' && source == 77) {
            update_store(modifiers.white_castle, {castle_k: false, castle_q: modifiers.white_castle_.castle_q})
        }
    }else {
        if(piece == 'K') {
            update_store(modifiers.black_castle, {castle_k: false, castle_q: false})
        }else if(piece == 'R' && source == '00') {
            update_store(modifiers.black_castle, {castle_k: modifiers.black_castle_.castle_k, castle_q: false})
        }else if(piece == 'R' && source == '07') {
            update_store(modifiers.black_castle, {castle_k: false, castle_q: modifiers.black_castle_.castle_q})
        }
    }
}

  export {
      selectSourcePiece,
      selectTargetPiece,
      selectPromotionPiece
  }