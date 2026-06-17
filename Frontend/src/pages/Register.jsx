import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "../authSlice";
import {Link, useNavigate} from "react-router"
import {useDispatch,useSelector } from "react-redux";



// Zod Schema
const registerSchema = z.object({
    firstName: z
      .string()
      .min(3, "First name is required"),

    lastName: z
      .string()
      .min(3, "Last name is required"),

    emailId: z
      .string()
      .min(5, "Email is required")
      .email("Invalid email address"),

    age: z.coerce
      .number()
      .min(10, "Age must be at least 10")
      .max(100, "Age must be at most 100"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a symbol"),

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });



const Register = () => {
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const { isAuthenticated } = useSelector((state) => state.auth);
        
        const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm({
            resolver: zodResolver(registerSchema),
        });

        useEffect(()=>{
            if(isAuthenticated){
                navigate('/');
            }
        }, [isAuthenticated, navigate]);

        
        const onSubmit = (data) => {
                const userData = { ...data };
                delete userData.confirmPassword;
                dispatch(registerUser(userData));
        };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121210] px-4 text-zinc-100">
        <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#242421] p-8 shadow-xl shadow-black/30">
            <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-100">
            Register
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* First Name */}
            <div>
                <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className="w-full rounded-lg border border-zinc-700 bg-[#2d2d2a] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />
                {errors.firstName && (
                <p className="mt-1 text-sm text-rose-400">
                    {errors.firstName.message}
                </p>
                )}
            </div>

            {/* Last Name */}
            <div>
                <input
                type="text"
                placeholder="Last Name"
                {...register("lastName")}
                className="w-full rounded-lg border border-zinc-700 bg-[#2d2d2a] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />
                {errors.lastName && (
                <p className="mt-1 text-sm text-rose-400">
                    {errors.lastName.message}
                </p>
                )}
            </div>

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

            {/* Age */}
            <div>
                <input
                type="number"
                placeholder="Age"
                {...register("age")}
                className="w-full rounded-lg border border-zinc-700 bg-[#2d2d2a] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />
                {errors.age && (
                <p className="mt-1 text-sm text-rose-400">
                    {errors.age.message}
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

            {/* Confirm Password */}
            <div>
                <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className="w-full rounded-lg border border-zinc-700 bg-[#2d2d2a] px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />
                {errors.confirmPassword && (
                <p className="mt-1 text-sm text-rose-400">
                    {errors.confirmPassword.message}
                </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full rounded-lg bg-indigo-500 py-3 font-semibold text-white transition-colors hover:bg-indigo-400"
            >
                Register
            </button>
            </form>
            <p className="mt-4 text-sm text-zinc-400">
              Already have an account <Link className="font-semibold text-indigo-400 hover:text-indigo-300" to="/signin">Login</Link>
            </p>
        </div>
        </div>
    );
};

export default Register;
