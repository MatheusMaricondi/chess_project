import { kingInXeque } from '../safeKing'
import { position_pieces } from '../../store/index'
import { getMoves } from '../piecesRules'
import { makeMove, undoMove } from '../logicMoves'
import lineAnalise from './metrics'
import { insufficientMaterial } from './rules'
import { pieces } from '../../helpers/utils'
import { renderMateInterface } from '../interface'
import { modifiers } from '../../store/index'
const { globalDeep } = modifiers.engine_settings_

const renderNewMoves = (nodeDeep) => {
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
        // if(moves == '' && kingInXeque(position_pieces)) console.log('MATE', globalDeep-nodeDeep)
        return (moves != '') ? moves_list : (kingInXeque(position_pieces) ? (white_turn ? -99-nodeDeep : 99+nodeDeep) : 0) //qual rei em xeque
    }
    return 0
}

const getMiniMaxValue = (value, node) => {
    const stage = globalDeep - node.deep
    if(node.evaluation == null) {
        node.evaluation = value
    }else if(stage%2 != 0) { //mini
        if(node.evaluation < value) node.evaluation = value
    }else { //max
        if(node.evaluation > value) node.evaluation = value
    }
}

const rootGetMiniMaxValue = (node, root) => {
    if(!root.evaluation) {
        root.evaluation = node.evaluation
        root.command = node.command
    }
    if(root.evaluation > node.evaluation) {
        root.evaluation = node.evaluation
        root.command = node.command
    }
}

const minimax = (nodes) => {
    nodes.forEach((it) => {
        if(it.children.length == 0) 
            evaluate(it)
    })
}

const evaluate = (node) => {
    saveChild(node)

    if(node.deep > 1  && node.children) minimax(node.children)
    if(node.deep == 1) {
        if(node.children) {
            node.children.forEach((last) => {
                makeMove([last.command])
                const value = lineAnalise(position_pieces, globalDeep)
                last.evaluation = value
                getMiniMaxValue(value, node)
                undoMove()
            })
        }else {
            getMiniMaxValue(node.evaluation, node)
        }
    }else {
        if(node.children)
        node.children.forEach((last) => {
            getMiniMaxValue(last.evaluation, node)
        })
        if(node.nodeRoot) rootGetMiniMaxValue(node, node.nodeRoot)
    }
    undoMove()
}
const saveChild = node => {
    makeMove([node.command])
    const moves = renderNewMoves(node.deep)
    if(moves.length > 0) {
        moves.forEach(move => {
            node.children.push(new Node(move, null, [], node.deep-1, null))
        })
    }else {
        node.evaluation = moves
        node.children = null
    }
}

class Node{
    constructor(command = null, evaluation = null, children = null, deep = null, nodeRoot = null) {
        this.evaluation = evaluation;
        this.children = children;
        this.deep = deep;
        this.command = command
        this.nodeRoot = nodeRoot
    }
}
class Tree{
    constructor(root = [], evaluation = null, command = null) {
        this.deep = globalDeep
        this.root = root
        this.evaluation = evaluation
        this.command = command
    }
    startEngine() {
        const moves = renderNewMoves(this.deep)
        if(moves.length > 0) {
            moves.forEach(move => {
                this.root.push(new Node(move, null, [], globalDeep-1, this))
            })
            minimax(this.root)
        }else {
            renderMateInterface(moves)
        }
    }
}

export default Tree