class Node {
    constructor(command = null, evaluation = null, children = null, deep = null) {
        this.evaluation = evaluation;
        this.children = children;
        this.deep = deep;
        this.command = command
    }
    saveChild() {
        let newNode = new Node(null, [], this.deep-1)
        let newNode2 = new Node(null, [], this.deep-1)
        this.children.push(newNode, newNode2)
    }
    evaluate() {
        const values = [2,4,5]
        values.forEach(it => {
            let node = new Node(it)
            this.children.push(node)
        })
    }
}
class Tree {
    constructor(deep = null, root = []) {
        this.root = root
        this.deep = deep
    }
    startEngine(moves) {
        console.log(moves)
        // this.insertRoot()
        // new Node(null, null, [], this.deep) // commands
    }
    saveChild() {
        // let node = new Node(null, null, [], this.deep) // commands
        let nodeList = this.getPossibleMoves()
        this.root.push(nodeList)
    }
    insertRoot() {
        if(this.root.length == 0) {
            this.saveChild()
            this.insertRoot()
        }else {
            this.minimax(this.root)
        }
    }
    minimax(node) {
        node.forEach(it => {
            if(it.children.length == 0) {
                if(it.deep > 1) {
                    it.saveChild()
                    this.minimax(it.children)
                }else {
                    it.evaluate()
                }
            }else {
                
            }
            
        })
    
    }
}

export default Tree