import './App.css'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import todoList from './contract/TodoList.json'

const contractAddress = '0xAFcaC307CDf6991868860d0EF044B6B481921C0B'
const abi = todoList.abi
const web3 = new Web3(Web3.givenProvider || 'http://localhost:3000')

function App() {
  const [acount, setAcount] = useState(null)
  const [todoVal, setTodoVal] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBlockChainData()
    getTaskFromBlockChain()
  }, [])

  const loadBlockChainData = async () => {
    if(window.ethereum){
      const account = await window.ethereum.request({method : 'eth_requestAccounts'})
      setAcount(account[0])
    }else{
      alert('please install metamast')
    }
    // const accounts = await web3.eth.getAccounts()

    //  console.log(taskCount)
  }

  const getTaskFromBlockChain = async () => {
    const taskContract = new web3.eth.Contract(abi, contractAddress)
    const taskCount = await taskContract.methods.taskCount().call()
    let taskArray = []
    for (var i = 1; i <= taskCount; i++) {
      const tasks = await taskContract.methods.tasks(i).call()
      console.log(tasks)
      taskArray.push(tasks)
    }
    setTasks(await taskArray)
  }

  const handleChange = (e) => {
    setTodoVal(e.target.value)
  }

  const handleAddTodo = () => {
    if(acount !==null){

      setLoading(true)
      const taskContract = new web3.eth.Contract(abi, contractAddress)
      taskContract.methods
      .createTask(todoVal)
      .send({ from: acount })
      .once('receipt', (e) => {
        console.log(e)
        setTodoVal('')
        setLoading(false)
      })
      .then((rs) => {
        console.log(rs)
        setTodoVal('')
        setLoading(false)
        
        getTaskFromBlockChain()
      })
    }else{
      alert('please connect metamask first')
    }
  }

  return (
    <div className="App">
      {/* <p>{acount}</p> */}
      <div className="todoContent">
        <h1>Todo Dapp</h1>
        <div className="todoSection">
          <div className="todoInp">
            <input
              type="text"
              name="todo"
              id="todo"
              value={todoVal}
              onChange={handleChange}
            />
            <button onClick={handleAddTodo} disabled={loading}>
              {' '}
              {loading ? 'loading...' : 'Add ToDo'}
            </button>
          </div>
        </div>
        <div className="todoList">
          <ul>
            {tasks.length ?
              tasks.map((val) => (
                <li key={val.id}>
                  <input type="checkbox" name="" id="" />
                  <p>{val.content}</p>
                </li>
              ))
           : <p>Empty</p> }
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
