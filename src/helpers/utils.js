import { modifiers } from  '../store/index'

const pieces = () => {
    const { white_turn, white_player } = modifiers.game_settings_
    const isEngineBlackTurn = white_player ? (white_turn != white_player) : (white_turn == white_player)

    const dinamicRules = {
        pawnDirection: isEngineBlackTurn ?  1 : -1,
        kingSafePawn: isEngineBlackTurn ? 7 : 1,
        pawnStart: isEngineBlackTurn ? 1 : 6,
        pawnPromotion: isEngineBlackTurn ? 6 : 1,
        pawnEnPassant: isEngineBlackTurn ? 4 : 3,
        kingCastle: isEngineBlackTurn ? 0 : 7,
        kingTarget: isEngineBlackTurn ? '06' : '76'
    }
    return {
        static_pieces:  new RegExp(/[A-Z-a-z]/),
        target_pieces: isEngineBlackTurn ? new RegExp(/[a-z]/) : new RegExp(/[A-Z]/),
        same_pieces: isEngineBlackTurn ?  new RegExp(/[A-Z]/) : new RegExp(/[a-z]/),
        dinamicRules
    }
}

export { pieces }