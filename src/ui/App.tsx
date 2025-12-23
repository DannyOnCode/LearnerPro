import {Routes, Route} from "react-router-dom";
import Session from "./Session.tsx";
import Workspace from "./Workspace.tsx";

function App() {
    return (
    <>
        <Routes>
            <Route path="/" element = {<Session/>} />
            <Route path="/workspace" element={<Workspace/>}></Route>
        </Routes>
    </>
  )
}

export default App
