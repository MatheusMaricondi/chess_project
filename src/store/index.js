import { writable } from 'svelte/store';

let position_pieces = writable([
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ','P','K',' ',' ',' ',' ',' '],
  [' ',' ','P',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ','p','p',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ','k',' ',' ']
])

let promotion_modal_object = {
  promotion_modal: writable(false),
  promotion_modal_: writable(false)
}

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

let modifiers = {
  game_settings: writable({white_turn: true, white_player: true}), // white true
  game_settings_: writable({}),
  engine_settings: writable({globalDeep: 3, tree: [], analise: false}), // tree: [{node: 0, command: null, evaluate: null, children: []}]
  engine_settings_: writable({}),
  xeque_mate: writable(null), // 0: draw, 1: player win, 2: enigine win
  xeque_mate_: writable(null),
  game_historic: writable([]), 
  game_historic_: writable([]),
}

let selected_piece_object = {
  selected_piece: writable({row: null, col: null}),
  selected_piece_: writable({})
}

let possible_moves_object = {
  possible_moves: writable([]),
  possible_moves_: []
}

possible_moves_object.possible_moves.subscribe(value => possible_moves_object.possible_moves_ = value)
selected_piece_object.selected_piece.subscribe(value => selected_piece_object.selected_piece_ = value)

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