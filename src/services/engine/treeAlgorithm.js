import { kingInXeque } from '../safeKing'
import { position_pieces } from '../../store/index'
import { getMoves } from '../piecesRules'
import { makeMove, undoMove } from '../logicMoves'
import lineAnalise from './metrics'
import { insufficientMaterial } from './rules'
import { pieces } from '../../helpers/utils'
import { renderMateInterface } from '../interface'
import { modifiers } from '../../store/index'

const renderNewMoves = () => {
    const { white_turn } = pieces()
    const gameDrow = insufficientMaterial(position_pieces)
    let moves = ''
    
    if(!gameDrow) {
        position_pieces.forEach((row, row_i) => {
            row.forEach((col, col_i) => {
                moves = getMoves(position_pieces[row_i][col_i], position_pieces, {row: row_i, col: col_i}, moves)
            })
        });
        let moves_list = moves.split(' ')
        moves_list.shift()

        return (moves != '') ? moves_list : (kingInXeque(position_pieces) ? (white_turn ? 99 : -99) : 0) //qual rei em xeque
    }else {
        return 0
    }
}

class Node{
    constructor(command = null, evaluation = null, children = null, deep = null) {
        this.evaluation = evaluation;
        this.children = children;
        this.deep = deep;
        this.command = command
    }

    undo() {
        const rootDeep = 7
        const historicDeep = rootDeep+1 - modifiers.game_historic_.length
        const undoQtd = this.deep - historicDeep
    
        for(let i=0;i<=undoQtd;i++) {
            undoMove()
        }
    }
    saveChild() {
        this.undo()
        makeMove([this.command])

        const moves = renderNewMoves()  

        if(moves.length > 0) {
            moves.forEach(move => {
                this.children.push(new Node(move, null, [], this.deep-1))
            })
        }else {
            this.evaluation = moves
            this.children = null
        }
    }
    evaluate() {
        this.saveChild()
        if(this.children) {

            this.children.forEach((last, idx) => {
                makeMove([last.command])
                const value = lineAnalise(position_pieces)
                last.evaluation = value
                undoMove()
            })
        }
        undoMove()
    }
}
class Tree{
    constructor(deep = null, root = []) {
        this.deep = deep
        this.root = root
    }
    startEngine() {
        const moves = renderNewMoves()

        if(moves.length > 0) {
            moves.forEach(move => {
                this.root.push(new Node(move, null, [], this.deep-1))
            })
            this.minimax(this.root)
        }else {
            renderMateInterface(moves)
        }
    }
    minimax(nodes) {
        nodes.forEach(it => {
            if(it.children.length == 0) {
                if(it.deep > 1) {
                    it.saveChild()
                    if(it.children) {
                        this.minimax(it.children)
                    }
                }else {
                    it.evaluate()
                }
            }
        })
    }
}

export default Tree