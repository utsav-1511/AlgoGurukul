import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../authSlice";
import {Link} from "react-router";


// Zod Schema
const loginSchema = z.object({
  emailId: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });
    useEffect(()=>{
        if(isAuthenticated){
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        dispatch(loginUser(data));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-lg">
            
            <h2 className="text-3xl font-bold text-white text-center mb-6">
            Login
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
                <input
                type="email"
                placeholder="Email"
                {...register("emailId")}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />

                {errors.emailId && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.emailId.message}
                </p>
                )}
            </div>

            {/* Password */}
            <div>
                <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />

                {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition"
            >
                Login
            </button>

            </form>
            <p>Already Have an Account <Link to="/signup">Register</Link></p>
        </div>
        </div>
    );
};

export default Login;
