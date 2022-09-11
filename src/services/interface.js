import {  modifiers, update_store, promotion_modal_object, position_pieces, selected_piece_object } from '../store/index'
import { renderBoard, renderPromotion, renderStatusGameBox, closeStatusGameBox } from '../components/board.svelte'

const renderMateInterface = status => {
    const { xeque_mate, game_settings, game_settings_: {white_turn, white_player} } = modifiers
    let text
    update_store(xeque_mate, status)
    update_store(game_settings, {white_turn: !white_turn, white_player})

    switch(status) {
        case 1: text = 'You won'; break;
        case 2: text = 'The machine won'; break;
        case 0: text = 'The game is drow'; break;
    }
    renderStatusGameBox(text)
}

const renderPromotionInterface = move => {
    const { promotion_modal, promotion_modal_ } = promotion_modal_object

    if(!promotion_modal_) { // promotion option
            renderPromotion(move) 
            update_store(promotion_modal, true)
        }else {
            console.log('modal aberto')
        }
}

const renderBoardInterface = () => {
    renderBoard()
}

const restartGame = () => {
    const { white_castle, black_castle, en_passant, xeque_mate } = modifiers
    const pieces = {
        0: ['R','N','B','Q','K','B','N','R'],
        1: 'P',
        6: 'p',
        7: ['r','n','b','q','k','b','n','r'],
    }
    update_store(white_castle, { castle_k: true, castle_q: true })
    update_store(black_castle, { castle_k: true, castle_q: true })
    update_store(en_passant, { position: null })
    update_store(selected_piece_object.last_piece_moved, {ini: null, fin: null})
    update_store(xeque_mate, null)
    
    for(let row=0;row<=7;row++)
        for(let col=0;col<=7;col++) {
            if(row == 0 || row == 7) {
                position_pieces[row][col] = pieces[row][col]
            }else if(row > 1 && row < 6) {
                position_pieces[row][col] = ' '
            }else {
                position_pieces[row][col] = pieces[row]
            }
        }
    renderBoard()
    closeStatusGameBox()
}

export { renderMateInterface, renderPromotionInterface, renderBoardInterface, restartGame }