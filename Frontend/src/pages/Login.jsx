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
        <div className="min-h-screen flex items-center justify-center bg-[#121210] px-4 text-zinc-100">
        <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#242421] p-8 shadow-xl shadow-black/30">
            
            <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-100">
            Login
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
                <input
                type="email"
                placeholder="Email"
                {...register("emailId")}
                className="w-full rounded-lg border border-zinc-700 bg-[#2d2d2a] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />

                {errors.emailId && (
                <p className="mt-1 text-sm text-rose-400">
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
                className="w-full rounded-lg border border-zinc-700 bg-[#2d2d2a] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />

                {errors.password && (
                <p className="mt-1 text-sm text-rose-400">
                    {errors.password.message}
                </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full rounded-lg bg-indigo-500 py-3 font-semibold text-white transition-colors hover:bg-indigo-400"
            >
                Login
            </button>

            </form>
            <p className="mt-4 text-sm text-zinc-400">
              Already have an account <Link className="font-semibold text-indigo-400 hover:text-indigo-300" to="/signup">Register</Link>
            </p>
        </div>
        </div>
    );
};

export default Login;
