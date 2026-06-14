import { Routes, Route, Navigate } from "react-router";
import Homepage from "./pages/Homepage";
import Login  from "./pages/Login";
import Register from "./pages/Register";
import './App.css'
import {checkAuth} from "./authSlice";
import {useSelector,useDispatch} from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";

function App() {
  const {isAuthenticated,loading,user}=useSelector((state)=>state.auth);
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(checkAuth())
  },[dispatch]);

if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ?<Homepage/>:<Navigate to="/signup"></Navigate>}></Route>
        <Route path="/signin" element={isAuthenticated ?<Navigate to="/"></Navigate>:<Login/>}></Route>
        <Route path="/signup" element={isAuthenticated ?<Navigate to="/"></Navigate>:<Register/>}></Route>
        <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
        {/* <Route path="/admin" element={<AdminPanel/>}></Route> */}
        <Route path="/admin" element={isAuthenticated && user?.role=="admin" ?<Navigate to="/"></Navigate>:<AdminPanel/>}></Route>
      </Routes>
    </>
  ) 
}

export default App
