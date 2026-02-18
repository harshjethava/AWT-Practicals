import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function Demo(props) {
  const [count, setCount] = useState(0)

  return (
    <>
     <h1>{props.name}Counter App</h1>
      {/* <div> 
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1> */}
      <div className="card">
         count is {count}<br></br><br></br>
        <button onClick={() => setCount((count) => count + 1)}>
         Add
        </button><br></br><br></br>
        <button onClick={() => setCount((count) => count - 1)}>
          Subtract
        </button><br></br><br></br>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      {/* <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default Demo
