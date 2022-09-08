<script context="module">
  import { position_pieces, promotion_modal_object, update_store } from '../store/index'
  import { pieces as p } from '../helpers/utils'
  import { selectSourcePiece, selectTargetPiece, selectPromotionPiece } from '../services/logicMoves'
  import { restartGame } from '../services/interface'

  let chessboard = Array(8).fill().map(() => Array(8).fill())
  let select_square = '#89c88a'
  let played_square = '#F8F8B8'
  const pieces = {P: "&#9823;",R: '&#9820;',N: '&#9822;',B: '&#9821;',Q: '&#9819;',K: '&#9818;',p: '&#9817;',r: '&#9814;',n: '&#9816;',b: '&#9815;',q: '&#9813;',k: '&#9812;'} 

  window.addEventListener("keydown", function (event) {
    if(event.key == 'Escape' || event.key == 'Esc') {
      deletePromotionOptions()
    }
  })

  function renderMateBox(text) {
    let mateBox = document.getElementById('mate')

    mateBox.style.cssText = 'width: 450px; height: 50px; font-size: 25px; padding-left: 200px; background-color: #181818; align-items: center; color: rgb(94 94 94);'
    mateBox.innerHTML = text
  }

  function closeRenderMateBox() {
    let mateBox = document.getElementById('mate')
    mateBox.style.cssText = ''
    mateBox.innerHTML = ''
  }

  function renderPromotion(piece_options) {
    let promotion = document.getElementById('promotion')

    piece_options.forEach(it => {
      let it_piece = document.createElement('div')
      it_piece.onclick = () => closeOptions(it)
      it_piece.innerHTML = pieces[it.charAt(5)]
      it_piece.style.cssText = 'font-size: 85px;background-color:white;'
      promotion.appendChild(it_piece)
    })
   
  }

  function closeOptions(piece) {
    deletePromotionOptions()
    selectPromotionPiece(piece)
  }

  function deletePromotionOptions() {
    let options = document.getElementById('promotion')
    let first = options.firstElementChild;
    while(first) {
      first.remove();
      first = options.firstElementChild;
    }
    update_store(promotion_modal_object.promotion_modal, false)
  }

  function renderBoard(selected_piece = null, possible_moves = null, previousMove = null) {
    let width_size = 65
    let pieces_pad = (20 / 100) * width_size
    let height_size = width_size + pieces_pad
    const previousMoveObject = {}
    const { same_pieces } = p()

    if(previousMove) {
      previousMoveObject.src = previousMove[0].substr(1,2)
      previousMoveObject.trg = previousMove[0].substr(3,4)
    }

    let colors = ['#CECECE', '#797979']
    chessboard.forEach((row, row_i) => {
      row.forEach((col, col_i) => {
        if(pieces[position_pieces[row_i][col_i]]) {
          chessboard[row_i][col_i].innerHTML = pieces[position_pieces[row_i][col_i]]
          if(same_pieces.test(position_pieces[row_i][col_i])) { 
            chessboard[row_i][col_i].onclick = () => selectSourcePiece({row: row_i, col: col_i})
          }else {
            chessboard[row_i][col_i].onclick = () => selectTargetPiece({row: row_i, col: col_i});
          }
        }else {
          chessboard[row_i][col_i].innerHTML = null
          chessboard[row_i][col_i].onclick = () => selectTargetPiece({row: row_i, col: col_i});
        }
        
        chessboard[row_i][col_i].style.cssText = `user-select: none; background-color: ${colors[((row_i+1)+(col_i+1))%2]}; height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding-left: ${pieces_pad}px; border: solid 1.5px #222222;`

        if(selected_piece) {
          if((row_i == selected_piece.row) && (col_i == selected_piece.col)) {
            chessboard[row_i][col_i].style.cssText = `user-select: none; background-color: ${select_square}; height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding-left: ${pieces_pad}px; border: solid 1.5px #222222;`
          }

          if(possible_moves) {
            possible_moves.forEach(it => {
              if(it.row == row_i && it.col == col_i) {
                if(position_pieces[it.row][it.col] != ' ') 
                  chessboard[row_i][col_i].style.cssText = `user-select: none; background: ${colors[((row_i+1)+(col_i+1))%2]}; background: radial-gradient(circle, ${colors[((row_i+1)+(col_i+1))%2]} 80%, ${select_square} 80%); height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding-left: ${pieces_pad}px; border: solid 1.5px #222222;`
                else
                  chessboard[row_i][col_i].style.cssText = `user-select: none; background: ${colors[((row_i+1)+(col_i+1))%2]}; background: radial-gradient(circle, ${select_square} 20%, ${colors[((row_i+1)+(col_i+1))%2]} 20%); height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding-left: ${pieces_pad}px; border: solid 1.5px #222222;`
              }
            })
          }
          
        }
        if(previousMove) {
          if(previousMove && ((previousMoveObject.src == `${row_i}${col_i}`) || (previousMoveObject.trg == `${row_i}${col_i}`))) {
            chessboard[row_i][col_i].style.cssText = `user-select: none; background-color: ${played_square}; height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding-left: ${pieces_pad}px; border: solid 1.5px #222222;`
          }
        }
      })
    })
  };
  
  export {
    renderBoard,
    renderPromotion,
    renderMateBox,
    closeRenderMateBox
  }
</script>
<main>
    <div><button on:click={restartGame}>New Game</button></div>
    <div>
      {#each chessboard as row, row_i}
      {#each row as col, col_i}
      <div bind:this={chessboard[row_i][col_i]}></div>
      {/each}
      {/each}
    </div>
    <div id='promotion'></div>
    <div id='mate'></div>
</main>

<style>
  div {
      width: 700px;  
      flex-direction: row;
      display: flex;
      flex-wrap: wrap;
    }
</style>
