import { useState } from 'react'
import './App.css'
import reactLogo from "./assets/react.svg";

export default function Home() {
    const [count, setCount] = useState(0)

    function getOnClick() {
        return () => setCount((count) => count + 1);
    }

    return (
        <>
            <div>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={getOnClick()}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}