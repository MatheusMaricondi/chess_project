import {  modifiers, update_store, promotion_modal_object } from '../store/index'
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

const renderBoardInterface = x => {
    renderBoard()
}

export { renderMateInterface, renderPromotionInterface, renderBoardInterface }