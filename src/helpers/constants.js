import { modifiers } from "../store";

const table_pieces = () => {
    const { white_turn } = modifiers.game_settings_
    const lowerPieces = ['p','r','b','n','q','k']
    const upperPieces = ['P','R','B','N','Q','K']

    let pieces_list = white_turn ? lowerPieces : upperPieces
    let target_list = white_turn ? upperPieces : lowerPieces

    let pieces = {pawn: pieces_list[0], rook: pieces_list[1], bishop: pieces_list[2], knight: pieces_list[3], queen: pieces_list[4], king: pieces_list[5]}
    let target = {pawn: target_list[0], rook: target_list[1], bishop: target_list[2], knight: target_list[3], queen: target_list[4], king: target_list[5]}

    return { pieces, target }
}

export {
    table_pieces
}