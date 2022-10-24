import {  modifiers, update_store, promotion_modal_object, position_pieces } from '../store/index'
import { renderBoard, renderPromotion, renderStatusGameBox, closeStatusGameBox } from '../components/board.svelte'

const renderMateInterface = status => {
    let text
    update_store(modifiers.xeque_mate, status)
    if(status>0) text = 'You won'
    if(status<0) text = 'The machine won'
    if(status==0) text = 'The game is drow'
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

const restartGame = (engineDeep) => {
    const { xeque_mate, game_historic } = modifiers
    const pieces = {
        0: ['R','N','B','Q','K','B','N','R'],
        1: 'P',
        6: 'p',
        7: ['r','n','b','q','k','b','n','r'],
    }

    update_store(xeque_mate, null)
    update_store(game_historic, [])
    update_store(modifiers.engine_settings, {globalDeep: engineDeep, tree: [], analise: false})
    
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