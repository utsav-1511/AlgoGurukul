import { Routes, Route, Navigate, useNavigate } from "react-router";
import Homepage from "./pages/Homepage";
import Login  from "./pages/Login";
import Register from "./pages/Register";
import './App.css'
import {checkAuth} from "./authSlice";
import {useSelector,useDispatch} from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import AdminCreate from "./Components/AdminCreate";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDelete from "./Components/AdminDelete";
import AdminVideo from "./Components/AdminVideo";
import AdminUpload from "./Components/AdminUpload";

function AdminRoute({ user, children }) {
  const navigate = useNavigate();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!isAdmin) {
      alert("You are not Admin");
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  return isAdmin ? children : null;
}

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
        <Route path="/" element={<Homepage/>}></Route>
        <Route path="/dashboard" element={isAuthenticated ?<UserDashboard/>:<Navigate to="/signin"></Navigate>}></Route>
        <Route path="/signin" element={isAuthenticated ?<Navigate to="/"></Navigate>:<Login/>}></Route>
        <Route path="/signup" element={isAuthenticated ?<Navigate to="/"></Navigate>:<Register/>}></Route>
        <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
        <Route path="/admin" element={<AdminRoute user={user}><AdminPanel/></AdminRoute>}></Route>
        <Route path="/admin/dashboard" element={<AdminRoute user={user}><AdminDashboard/></AdminRoute>}></Route>
        <Route path="/admin/create" element={<AdminRoute user={user}><AdminCreate/></AdminRoute>}></Route>
        <Route path="/admin/delete/" element={<AdminRoute user={user}><AdminDelete/></AdminRoute>}></Route>
        <Route path="/admin/video" element={<AdminRoute user={user}><AdminVideo/></AdminRoute>}></Route>
        <Route path="/admin/upload/:problemId" element={<AdminRoute user={user}><AdminUpload/></AdminRoute>}></Route>
      </Routes>
    </>
  ) 
}

export default App
