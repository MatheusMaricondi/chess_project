import { position_pieces, selected_piece_object, possible_moves_object, update_store, promotion_modal_object, modifiers } from '../store/index'
import { renderBoard } from '../components/board.svelte'
import { findPossibleMoves, getMoves } from '../services/piecesRules'
import { table_pieces } from '../helpers/constants'
import { pieces, getHistoricLayout, movesToPosition } from '../helpers/utils'
import { kingInXeque } from './safeKing'
import { renderPromotionInterface } from './interface'

const selectSourcePiece = position => {
    const {row, col} = position
    const { row: s_row, col: s_col } = selected_piece_object.selected_piece_
    const { white_turn, white_player } = modifiers.game_settings_
    const { xeque_mate_ } = modifiers
    const { lastMoves, xequeStatus } = getHistoricLayout()
    let possibleMovesList = []

    if(white_player == white_turn && (xeque_mate_ == null)) {
        if(s_row == row && s_col == col) { // selected the same piece
            update_store(selected_piece_object.selected_piece, {})
            update_store(possible_moves_object.possible_moves, [])
            renderBoard(selected_piece_object.selected_piece_, [], lastMoves, xequeStatus)
        }else { // selected new piece
            const moves = getMoves(position_pieces[row][col], position_pieces, position, '')
            console.log('POSSIBLE MOVES: ',moves)

            possibleMovesList = movesToPosition(moves)
            if(possibleMovesList.length > 0) {
                update_store(selected_piece_object.selected_piece, {row, col})
                update_store(possible_moves_object.possible_moves, moves)
                renderBoard(selected_piece_object.selected_piece_, possibleMovesList, lastMoves, xequeStatus)
            }  
        }
    }
}

const selectTargetPiece = target => {
    const {row: t_row, col: t_col} = target
    const { row: s_row, col: s_col } = selected_piece_object.selected_piece_
    const { lastMoves, xequeStatus } = getHistoricLayout()

    if(possible_moves_object.possible_moves_ != '' || selected_piece_object.selected_piece_.row) {
        const list_moves = possible_moves_object.possible_moves_.split(' ')
        const get_move = list_moves.filter(it => it.includes(`${s_row}${s_col}${t_row}${t_col}`))
        if(get_move.length == 1) { // normal option
            beforeMakeMove(get_move)
        }else if(get_move.length > 2) { // promotion option
            renderPromotionInterface(get_move)
        }else {
            console.log('invalid move')
            renderBoard(null, [], lastMoves, xequeStatus)
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
    },0)
}

const makeMove = command => {
    const { xeque_mate_ } = modifiers
    const { rook, king, pawn } = table_pieces().pieces
    const { dinamicRules: { kingCastle, kingTarget } } = pieces()
    
    let piece 
    let source
    let target
    let en_passant = null
    let modifier_pieces = command[0].charAt(0)

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
        }
        afterMakeMove(command, modifier_pieces, piece, source, en_passant)
    }
}

const undoMove = () => {
    const { pawn } = table_pieces().pieces
    const { pawn: t_pawn, king: t_king, rook: t_rook } = table_pieces().target
    const { dinamicRules: { kingCastleUndo, kingTargetUndo} } = pieces()
    const { lastMoves, xequeStatus } = getHistoricLayout()
    let command = null

    if(modifiers.game_historic_.length > 0) {
        command = modifiers.game_historic_[modifiers.game_historic_.length-1].sts.move
        const newHistoric = modifiers.game_historic_.slice(0,modifiers.game_historic_.length-1)
        update_store(modifiers.game_historic, newHistoric)
    }
    if(command) {
        let modifiers = command.charAt(0)

        if(modifiers == '^') {
            const piece = command.charAt(6)
            position_pieces[command.charAt(1)][command.charAt(2)] = t_pawn
            position_pieces[command.charAt(3)][command.charAt(4)] = piece ? piece : ' '
        }else if(['-','_'].includes(modifiers)) {
            const source = command.slice(command.length-4, command.length-2) 
            const target = command.slice(command.length-2, command.length)

            position_pieces[source.charAt(0)][source.charAt(1)] = t_king
            position_pieces[target.charAt(0)][target.charAt(1)] = ' '
            if(target == kingTargetUndo) {
                position_pieces[kingCastleUndo][7] = t_rook
                position_pieces[target.charAt(0)][parseInt(target.charAt(1))-1] = ' '
            }else {
                position_pieces[kingCastleUndo][0] = t_rook
                position_pieces[target.charAt(0)][parseInt(target.charAt(1))+1] = ' '
            }
        }else if(modifiers == ';') {
            position_pieces[command.charAt(1)][command.charAt(2)] = t_pawn
            position_pieces[command.charAt(3)][command.charAt(4)] = ' '
            position_pieces[command.charAt(1)][command.charAt(4)] = pawn
        }else {
            let target = command.charAt(5)
            position_pieces[command.charAt(1)][command.charAt(2)] = modifiers == ',' ? t_pawn : modifiers
            position_pieces[command.charAt(3)][command.charAt(4)] = target ? target : ' '
        }
    }
    if(!modifiers.engine_settings_.analise)
        renderBoard(null, [], lastMoves, xequeStatus)
}

const afterMakeMove = (command, modifier_pieces, piece, source, en_passant=null) => {
    const castleStatus = castle_modifiers(piece, source, modifier_pieces)
    const lastPieceMoved = {ini: command[0].substr(1,2), fin: command[0].substr(3,2)}
    const newMove = {sts: {move: command[0], castle: castleStatus, en_passant}, layout: {xeque: null, last_pieces: lastPieceMoved}}

    update_store(modifiers.game_historic, [...modifiers.game_historic_, newMove])
    const xequeStatus = verifyXeque()
        
    if(!modifiers.engine_settings_.analise) 
        renderBoard(null, [], lastPieceMoved, xequeStatus)
}
const verifyXeque = () => {
    const { white_turn } = pieces()
    const xeque = kingInXeque(position_pieces)
    const xeque_status = xeque ? (white_turn ? 'k' : 'K') : null

    if(xeque) {
        const newHistoric = modifiers.game_historic_
        newHistoric[newHistoric.length-1].layout.xeque = xeque_status
        update_store(modifiers.game_historic, newHistoric)
    }

    return xeque_status
}

const make_engine_moves = () => {
    const { white_turn } = pieces()
    const isEngineTurn = !white_turn

    if(isEngineTurn) {
        update_store(modifiers.engine_settings, {...modifiers.engine_settings_, analise: true})


        const better_move = findPossibleMoves(isEngineTurn) // engine plays
        
        update_store(modifiers.engine_settings, {...modifiers.engine_settings_, analise: false})

        if(better_move) {

            // update_store(modifiers.engine_settings, {...modifiers.engine_settings_, analise: false})
            // makeMove([better_move])
        }
    }
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
      makeMove,
      undoMove
  }