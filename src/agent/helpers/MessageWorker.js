export default class MessageWorker {
  parseMessage(message) {
    if(message.endsWith("\u0000"))
      message = message.substring(0, msg.length - "\u0000".length)
    let array = message.match(/(\(l[~\d\.]+|[\\\"\w]+|\))/g)
    let res = { message, p: [] }
    this.parse(array, { idx: 0 }, res)
    this.makeCommand(res)
    return res
  }
  
  parseInner(array, index, res) {
    while (array[index.idx] != ")") {
      if(array[index.idx] == "(") {
        let r= { p: [] }
        this.parse(array, index, r)
        res.p.push(r)
      } else {
        let num = parseFloat(array[index.idx])
        res.p.push(isNaN(num) ? array[index.idx] : num)
        index.idx++
      }
    }
    index.idx++
  }
  
  parse(array, index, res) {
    if (array[index.idx] != '(')
      return
    index.idx++
    this.parseInner(array, index,res)
  }

  makeCommand(res) {
    if (res.p?.length) {
      res.command = res.p.shift()
      for (const value of res.p)
        this.makeCommand(value)
    }
  }
}