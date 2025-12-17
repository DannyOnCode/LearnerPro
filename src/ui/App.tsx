import {Routes, Route, NavLink} from "react-router-dom";
import Home from "./Home.tsx";
import Session from "./Session.tsx";
import Workspace from "./Workspace.tsx";

function App() {
    return (
    <>
        <nav>
            <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : "nav-link"}>
                Home
            </NavLink>
            <NavLink to="/session" className={({ isActive }) => isActive ? "active-link" : "nav-link"}>
                Session
            </NavLink>
        </nav>
        <Routes>
            <Route path="/" element = {<Home/>} />
            <Route path="/session" element={<Session/>} />
            <Route path="/workspace" element={<Workspace/>}></Route>
        </Routes>
    </>
  )
}

export default App
