import './App.css'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import todoList from './contract/TodoList.json'
import {
  init,
  useConnectWallet,
  useSetChain,
  useWallets,
} from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import blocknativeLogo from './icons/blocknative-logo'
import blocknativeIcon from './icons/blocknative-icon'

const INFURA_ID = '56eab642884a4d838e45b49eb22a4cde'

const injected = injectedModule()
const walletConnect = walletConnectModule()

const initWeb3Onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum',
      rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    },
    {
      id: '0x3',
      token: 'tROP',
      label: 'Ropsten',
      rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Rinkeby',
      rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    },
    {
      id: '0x38',
      token: 'BNB',
      label: 'Binance',
      rpcUrl: 'https://bsc-dataseed.binance.org/',
    },
    {
      id: '0x89',
      token: 'MATIC',
      label: 'Polygon',
      rpcUrl: 'https://matic-mainnet.chainstacklabs.com',
    },
    {
      id: '0xfa',
      token: 'FTM',
      label: 'Fantom',
      rpcUrl: 'https://rpc.ftm.tools/',
    },
  ],
  appMetadata: {
    name: 'Blocknative Web3-Onboard',
    icon: blocknativeIcon,
    logo: blocknativeLogo,
    description: 'Demo app for Web3-Onboard',
    recommendedInjectedWallets: [
      // { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://www.blocknative.com/terms-conditions',
      privacyUrl: 'https://www.blocknative.com/privacy-policy',
    },
    gettingStartedGuide: 'https://blocknative.com',
    explore: 'https://blocknative.com',
  },
})

const contractAddress = '0xAFcaC307CDf6991868860d0EF044B6B481921C0B'
const abi = todoList.abi
const web3 = new Web3(`https://rinkeby.infura.io/v3/${INFURA_ID}`)

function App() {
  const [acount, setAcount] = useState(null)
  const [todoVal, setTodoVal] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const connectedWallets = useWallets()

  const [web3Onboard, setWeb3Onboard] = useState(null)

  

  const getTaskFromBlockChain = async () => {
    const taskContract = new web3.eth.Contract(abi, contractAddress)
    const taskCount = await taskContract.methods.taskCount().call()
    // console.log(taskCount)
    let taskArray = []
    for (var i = 1; i <= taskCount; i++) {
      const tasks = await taskContract.methods.tasks(i).call()
      // console.log(tasks)
      taskArray.push(tasks)
    }
    setTasks(await taskArray)
  }

  useEffect(() => {
    // loadBlockChainData()
    setWeb3Onboard(initWeb3Onboard)
    getTaskFromBlockChain()
  }, [])

  const handleChange = (e) => {
    setTodoVal(e.target.value)
  }

  const handleAddTodo = () => {
    if (wallet) {
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
        }).catch((err)=>{
          setLoading(false)
          console.log(err)
        })
    } else {
      alert('please connect metamask first')
    }
  }

  const handleConnect = async ()=>{
     connect().then(()=>{
       console.log(wallet)
     })
  }

  useEffect(()=>{
    if(wallet){

      console.log(wallet.accounts[0])
      setAcount(wallet.accounts[0].address)
    }
  },[connect,wallet])

  if (!web3Onboard) return <div>Loading...</div>

  return (
    <div className="App">
      <div className="todoContent">
        <h1>Todo Dapp</h1>
        {!wallet && (
          <button
            className="bn-demo-button"
            onClick={() => {
              handleConnect()
            }}
          >
            Select a Wallet
          </button>
        )}
        {/* <p>{wallet}</p> */}
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
            {tasks.length ? (
              tasks.map((val) => (
                <li key={val.id}>
                  <input type="checkbox" name="" id="" />
                  <p>{val.content}</p>
                </li>
              ))
            ) : (
              <p>Empty</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
