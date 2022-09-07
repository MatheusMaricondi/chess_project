import {  modifiers, update_store, promotion_modal_object, position_pieces } from '../store/index'
import { renderBoard, renderPromotion, renderMateBox } from '../components/board.svelte'

const renderMateInterface = status => {
    const { xeque_mate } = modifiers
    let text
    update_store(xeque_mate, status)

    switch(status) {
        case 1: text = 'You won'; break;
        case 2: text = 'The machine won'; break;
        case 0: text = 'The game is drow'; break;
    }
    renderMateBox(text)
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
    const pieces = {
        0: ['R','N','B','Q','K','B','N','R'],
        1: 'P',
        6: 'p',
        7: ['r','n','b','q','k','b','n','r'],
    }
    for(let row=0;row<=7;row++)
        for(let col=0;col<=7;col++) {
            // console.log(col)
            if(row == 0 || row == 7) {
                position_pieces[row][col] = pieces[row][col]
            }else if(row > 1 && row < 6) {
                position_pieces[row][col] = ' '
            }else {
                position_pieces[row][col] = pieces[row]
            }
        }
    renderBoard()
}

export { renderMateInterface, renderPromotionInterface, renderBoardInterface, restartGame }