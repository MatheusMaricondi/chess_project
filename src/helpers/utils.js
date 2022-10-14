import { modifiers } from  '../store/index'

const pieces = () => {
    const { game_historic_ } = modifiers
    const movePosition = game_historic_.length-1
    const whiteTurn = (movePosition%2 != 0)

    const dinamicRules = {
        pawnDirection: whiteTurn ?  -1 : 1,
        kingSafePawn: whiteTurn ? 1 : 7,
        pawnStart: whiteTurn ? 6 : 1,
        pawnPromotion: whiteTurn ? 1 : 6,
        pawnEnPassant: whiteTurn ? 3 : 4,
        kingCastle: whiteTurn ? 7 : 0,
        kingTarget: whiteTurn ? '76' : '06',
        kingCastleUndo: whiteTurn ? 0 : 7,
        kingTargetUndo: whiteTurn ? '06' : '76'
    }
    return {
        static_pieces:  new RegExp(/[A-Z-a-z]/),
        target_pieces: whiteTurn ? new RegExp(/[A-Z]/) : new RegExp(/[a-z]/),
        same_pieces: whiteTurn ? new RegExp(/[a-z]/) : new RegExp(/[A-Z]/),
        dinamicRules,
        white_turn: whiteTurn
    }
}

const getHistoricLayout = () => {
    const { game_historic_ } = modifiers
    let lastMoves, xequeStatus = []

    if(game_historic_.length > 0) {
        const moves = game_historic_[game_historic_.length-1]
        if(moves) {
            lastMoves = moves.layout.last_pieces
            xequeStatus = moves.layout.xeque
        }
    }

    return { lastMoves, xequeStatus }
}

const movesToPosition = moves => {
    let possibleMovesList
    let newPossibleMovesList = []
    possibleMovesList = moves.split(' ')
    possibleMovesList.shift()
    possibleMovesList.forEach(it => {
        newPossibleMovesList.push({row: it.charAt(3), col: it.charAt(4)})
    })
    return newPossibleMovesList
}

export { pieces, getHistoricLayout, movesToPosition }