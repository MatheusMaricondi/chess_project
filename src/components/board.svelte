<script context="module">
  import { position_pieces, promotion_modal_object, update_store, modifiers } from '../store/index'
  import { pieces as p } from '../helpers/utils'
  import { selectSourcePiece, selectTargetPiece, selectPromotionPiece } from '../services/logicMoves'
  import { restartGame } from '../services/interface'
  import { standard } from '../services/getPieces';

  let deepOptions = [
		{ value: 1, text: `Very Easy` },
		{ value: 3, text: `Easy` },
		{ value: 5, text: `Medium` },
		{ value: 7, text: `Hard` },
		{ value: 9, text: `Professional` },
	];

  let engineDeep = deepOptions[0].value

  let chessboard = Array(8).fill().map(() => Array(8).fill())
  let select_square = '#89c88a'
  let played_square = '#F8F8B8'
  let xeque_square = '#FC8979'
  const pieces = {P: standard.b_pawn,R: standard.b_rook,N: standard.b_knight,B: standard.b_bishop,Q: standard.b_queen,K: standard.b_king,p: standard.w_pawn,r: standard.w_rook,n: standard.w_knight,b: standard.w_bishop,q: standard.w_queen,k: standard.w_king} 

  window.addEventListener("keydown", function (event) {
    if(event.key == 'Escape' || event.key == 'Esc') {
      deletePromotionOptions()
    }
  })

  function dragstart_handler(ev) {
    console.log('event',ev.target.id)
    ev.dataTransfer.setData("text/plain", ev.target.id);
  }

  function getDraggableElement(ev, id) {
    const {row, col} = id
    const idElement = `${row}${col}`
    selectSourcePiece(id)
  
    // const element = document.getElementById(idElement)
    // element.addEventListener("dragstart", dragstart_handler);
  }

  function getTargetElement(ev) {
    console.log(ev)
  }
  
  function renderStatusGameBox(text) {
    let mateBox = document.getElementById('mate')

    mateBox.style.cssText = 'width: 450px; height: 50px; font-size: 25px; padding-left: 200px; background-color: #181818; align-items: center; color: rgb(94 94 94);'
    mateBox.innerHTML = text
  }

  function closeStatusGameBox() {
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

  function renderBoard(selected_piece = null, possible_moves = [], previousMove = null, kingXeque = null) {
    let width_size = 65
    let pieces_pad = 5
    let height_size = width_size 
    const { same_pieces } = p()

    let colors = ['#CECECE', '#797979']
    chessboard.forEach((row, row_i) => {
      row.forEach((col, col_i) => {
        if(pieces[position_pieces[row_i][col_i]]) {
          // const tagParagraph = document.createElement("p")
          // tagParagraph.innerHTML = pieces[position_pieces[row_i][col_i]]
          // chessboard[row_i][col_i].appendChild(tagParagraph)
          chessboard[row_i][col_i].innerHTML = pieces[position_pieces[row_i][col_i]]
          if(same_pieces.test(position_pieces[row_i][col_i])) { 
            chessboard[row_i][col_i].onclick = () => selectSourcePiece({row: row_i, col: col_i})
            // chessboard[row_i][col_i].id = `${row_i}${col_i}`
            // chessboard[row_i][col_i].onmousedown = ev => getDraggableElement(ev, {row: row_i, col: col_i})
            // chessboard[row_i][col_i].onmouseup = ev => getTargetElement(ev)

          }else {
            chessboard[row_i][col_i].onclick = () => selectTargetPiece({row: row_i, col: col_i});
          }
        }else {
          chessboard[row_i][col_i].innerHTML = null
          chessboard[row_i][col_i].onclick = () => selectTargetPiece({row: row_i, col: col_i});
        }
        
        chessboard[row_i][col_i].style.cssText = `user-select: none; background-color: ${colors[((row_i+1)+(col_i+1))%2]}; height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding: ${pieces_pad}px; border: solid 1.5px #222222;`

        if(previousMove) {
          if(previousMove.ini && ((previousMove.ini == `${row_i}${col_i}`) || (previousMove.fin == `${row_i}${col_i}`))) {
            chessboard[row_i][col_i].style.cssText = `user-select: none; background-color: ${played_square}; height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding: ${pieces_pad}px; border: solid 1.5px #222222;`
          }
        }
        if(selected_piece && possible_moves.length > 0) {
          if((row_i == selected_piece.row) && (col_i == selected_piece.col)) {
            chessboard[row_i][col_i].style.cssText = `user-select: none; background-color: ${select_square}; height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding: ${pieces_pad}px; border: solid 1.5px #222222;`
          }

          if(possible_moves.length > 0) {
            possible_moves.forEach(it => {
              if(it.row == row_i && it.col == col_i) {
                if(position_pieces[it.row][it.col] != ' ') 
                  chessboard[row_i][col_i].style.cssText = `user-select: none; background: ${colors[((row_i+1)+(col_i+1))%2]}; background: radial-gradient(circle, ${colors[((row_i+1)+(col_i+1))%2]} 80%, ${select_square} 85%); height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding: ${pieces_pad}px; border: solid 1.5px #222222;`
                else
                  chessboard[row_i][col_i].style.cssText = `user-select: none; background: ${colors[((row_i+1)+(col_i+1))%2]}; background: radial-gradient(circle, ${select_square} 15%, ${colors[((row_i+1)+(col_i+1))%2]} 20%); height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding: ${pieces_pad}px; border: solid 1.5px #222222;`
              }
            })
          }
        }
        if(kingXeque) {
          if(position_pieces[row_i][col_i] == kingXeque) {
            chessboard[row_i][col_i].style.cssText = `user-select: none; background: ${colors[((row_i+1)+(col_i+1))%2]}; background: radial-gradient(circle, ${xeque_square} 50%, ${colors[((row_i+1)+(col_i+1))%2]} 80%); height: ${height_size}px; width: ${width_size}px; font-size: 85px; align-content: space-around; padding: ${pieces_pad}px; border: solid 1.5px #222222;`
          }
        }
       
      })
    })
  };
  
  export {
    renderBoard,
    renderPromotion,
    renderStatusGameBox,
    closeStatusGameBox
  }
</script>
<main>
  <div style="display: flex;">
    <div>
      <div id="newGame">
        <!-- <label style="color:white;padding-top:10px;padding-right:5px">Choose Engine Deep</label> -->
        <select value={modifiers.engine_settings_.globalDeep} on:change="{(ev) => engineDeep = ev.target.value}">
          {#each deepOptions as deep}
            <option value={deep.value}>
              {deep.text}
            </option>
          {/each}
        </select>
        <button style="margin-left: 10px;" on:click={restartGame(engineDeep)}>
          New Game
        </button>
      </div>
   
      <div>
        {#each chessboard as row, row_i}
          {#each row as col, col_i}
            <div bind:this={chessboard[row_i][col_i]}></div>
          {/each}
        {/each}
      </div>
      <div id='promotion'></div>
      <div id='mate'></div>
    
      <div style="margin-top: 10px">
        <textarea rows="2" cols="70"></textarea>
      </div>
    </div>
  </div>
</main>

<style>
  div {
      width: 700px;  
      flex-direction: row;
      display: flex;
      flex-wrap: wrap;
    }
</style>
