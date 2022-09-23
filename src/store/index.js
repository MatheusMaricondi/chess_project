import { writable } from 'svelte/store';

let position_pieces = writable([
  [' ',' ',' ',' ','K',' ',' ','R'],
  [' ',' ',' ',' ','P',' ','N','P'],
  [' ',' ','P',' ','N',' ',' ','b'],
  [' ',' ','p',' ',' ',' ',' ',' '],
  [' ','p',' ',' ',' ','P',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ','p',' '],
  ['r',' ',' ',' ','k',' ',' ','r']
])

let promotion_modal_object = {
  promotion_modal: writable(false),
  promotion_modal_: writable(false)
}


let modifiers = {
  game_settings: writable({white_turn: true, white_player: true}), // white true
  game_settings_: writable({}),
  engine_settings: writable({deep: 1, nodes: 0, analise: false}),
  engine_settings_: writable({}),
  xeque_mate: writable(null), // 0: draw, 1: player win, 2: enigine win
  xeque_mate_: writable(null),
  game_historic: writable([]), // head: true, sts: {move: null, castle: {castle_k: true, castle_q: true}, en_passant: null}
  game_historic_: writable([]),
}

let selected_piece_object = {
  selected_piece: writable({row: null, col: null}),
  selected_piece_: writable({}),
  last_piece_moved: writable({ini: null, fin: null}),
  last_piece_moved_: writable({}),
  king_xeque: writable(null), // white: k, black: K
  king_xeque_: writable(null)
}

let possible_moves_object = {
  possible_moves: writable([]),
  possible_moves_: []
}

possible_moves_object.possible_moves.subscribe(value => possible_moves_object.possible_moves_ = value)
selected_piece_object.selected_piece.subscribe(value => selected_piece_object.selected_piece_ = value)
selected_piece_object.last_piece_moved.subscribe(value => selected_piece_object.last_piece_moved_ = value)
selected_piece_object.king_xeque.subscribe(value => selected_piece_object.king_xeque_ = value)

promotion_modal_object.promotion_modal.subscribe(value => promotion_modal_object.promotion_modal_ = value)
modifiers.game_settings.subscribe(value => modifiers.game_settings_ = value)
modifiers.xeque_mate.subscribe(value => modifiers.xeque_mate_ = value)
modifiers.engine_settings.subscribe(value => modifiers.engine_settings_ = value)
modifiers.game_historic.subscribe(value => modifiers.game_historic_ = value)

const update_store = (variable, new_value) => {
  variable.set(new_value)
}

position_pieces.subscribe(value => {
  position_pieces = value;
});


export {
    position_pieces,
    selected_piece_object,
    possible_moves_object,
    promotion_modal_object,
    modifiers,
    update_store
}