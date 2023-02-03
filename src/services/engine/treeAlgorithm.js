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
        // moves_list.splice(2)
        // if(moves == '' && kingInXeque(position_pieces)) console.log('MATE', globalDeep-nodeDeep)
        return (moves != '') ? moves_list : (kingInXeque(position_pieces) ? (white_turn ? -99-nodeDeep : 99+nodeDeep) : 0) //qual rei em xeque
    }
    return 0
}
const checkAlphaBeta = (node, stage) => {
   console.log('ALPHABETAPURNNING ',node, node.nodeRoot, stage?'MINI':'MAX')
   const phoda = recursiveNode(node, stage)
    console.log(phoda ? 'PODA' : 'NAO PODA')
}
const recursiveNode = (node, outStage) => {
    const inStage = ((globalDeep-node.nodeRoot.deep)%2)!=0
    const isValidRoot = (node.nodeRoot.evaluation) && (node.nodeRoot.deep != globalDeep)
    const isValidStage = (inStage != outStage)


    if(isValidRoot) { // verify if node is mini or max based node deep
        if(isValidStage) {
            if(inStage && (node.evaluation<node.nodeRoot.evaluation)) return true
            if(!inStage && (node.evaluation>node.nodeRoot.evaluation)) return true
            recursiveNode(node.nodeRoot, outStage)
        }else {
            recursiveNode(node.nodeRoot, outStage)
        }
    }

    return false
}

const getMiniMaxValue = (value, node, setRoot=false) => {
    console.log('getMiniMaxValue', value, node)
    const stage = ((globalDeep-node.deep)%2)!=0

    // recursiveNode(node.nodeRoot, stage)
    if(node.evaluation == null)  {
        node.evaluation = value
    }else {
        if(stage) { //mini
            if(node.evaluation < value) node.evaluation = value
        }else { //max
            if(node.evaluation > value) node.evaluation = value
        }
    }

    // checkAlphaBeta(node, stage)
    
    if(setRoot) {
        if(node.nodeRoot.evaluation == null) {
            node.nodeRoot.evaluation = node.evaluation
        }else {
            if(!stage) {
                if(node.nodeRoot.evaluation < node.evaluation && !node.root) node.nodeRoot.evaluation = node.evaluation
            }else {
                if(node.nodeRoot.evaluation > node.evaluation && !node.root) node.nodeRoot.evaluation = node.evaluation
            }
        }
        console.log(`SET ROOT -> ${node.command}-${node.evaluation} / ${node.nodeRoot.command}-${node.nodeRoot.evaluation}`)
    }
}

const rootGetMiniMaxValue = (node, root) => {
    console.log('rootGetMiniMaxValue')
    if(root.evaluation == null) root.evaluation = node.evaluation
    if(root.command == null) root.command = node.command

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
    if(node.children) {
        if(node.deep > 1) minimax(node.children)
        if(node.deep == 1) {
            const childrenLength = node.children.length-1
            console.log(node.deep, node.command, node.evaluation)
            node.children.forEach((last, index) => {
                let setRoot = childrenLength==index
                makeMove([last.command])
                const value = lineAnalise(position_pieces, globalDeep)
                last.evaluation = value
                getMiniMaxValue(value, node, setRoot)
                undoMove()
                
            })
        }else {
            console.log(node.deep,node.command, node.evaluation)
            // if(node.nodeRoot.deep < globalDeep) getMiniMaxValue(node.evaluation, node.nodeRoot, true)
            if(node.nodeRoot.deep < globalDeep) getMiniMaxValue(node.evaluation, node, true)
            if(node.nodeRoot.deep == globalDeep) rootGetMiniMaxValue(node, node.nodeRoot)
        }
    }
    undoMove()
}

const saveChild = node => {
    makeMove([node.command])
    const moves = renderNewMoves(node.deep)
    if(moves.length > 0) {
        moves.forEach(move => {
            node.children.push(new Node(move, null, [], node.deep-1, node))
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
        console.log('MACHINE INITIAL MOVES', moves)
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