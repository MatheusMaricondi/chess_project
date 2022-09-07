import { writable, derived } from 'svelte/store';

let position_pieces = writable([
  ['R','N','B','Q','K','B','N','R'],
  ['P','P','P','P','P','P','P','P'],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  [' ',' ',' ',' ',' ',' ',' ',' '],
  ['p','p','p','p','p','p','p','p'],
  ['r','n','b','q','k','b','n','r']
])

let promotion_modal_object = {
  promotion_modal: writable(false),
  promotion_modal_: writable(false)
}


let modifiers = {
  white_castle: writable({castle_k: true, castle_q: true}),
  white_castle_: writable({}),
  black_castle: writable({castle_k: true, castle_q: true}),
  black_castle_: writable({}),
  en_passant: writable({position: null}), // position by column 0 .. 7
  en_passant_: writable({}),
  game_settings: writable({white_turn: true, white_player: true}), // white true
  game_settings_: writable({}),
  engine_settings: writable({deep: 1, nodes: 2}),
  engine_settings_: writable({}),
  xeque_mate: writable(null), // 0: draw, 1: player1 win, 2: enigine win
  xeque_mate_: writable(null)
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
modifiers.white_castle.subscribe(value => modifiers.white_castle_ = value)
modifiers.black_castle.subscribe(value => modifiers.black_castle_ = value)
modifiers.en_passant.subscribe(value => modifiers.en_passant_ = value)
modifiers.game_settings.subscribe(value => modifiers.game_settings_ = value)
modifiers.xeque_mate.subscribe(value => modifiers.xeque_mate_ = value)
modifiers.engine_settings.subscribe(value => modifiers.engine_settings_ = value)

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