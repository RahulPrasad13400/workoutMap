class Node{
    constructor(value){
        this.value = value 
        this.next = null
    }
}

class Stack{
    constructor(){
        this.first = null
        this.last = null
        this.size = 0
    }
    push(value){
        const newNode = new Node(value)
        if(!this.first){
            this.first = newNode
            this.last = newNode
        }else{
            var temp = this.first
            this.first = newNode
            this.first.next = temp 
        }
        this.size++
        return this
    }
    pop(){
        if(!this.first) return undefined

        var temp = this.first 
        if(this.first === this.last){
            this.last = null
        }
        this.first = this.first.next
        return temp.value
    }
}

const list = new Stack()
list.push(40)
list.push(20)
list.push(30)

console.log(list.pop())