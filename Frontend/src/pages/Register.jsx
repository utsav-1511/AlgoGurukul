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
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-white text-center mb-6">
            Register
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* First Name */}
            <div>
                <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />
                {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
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
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />
                {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
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
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />
                {errors.emailId && (
                <p className="text-red-500 text-sm mt-1">
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
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />
                {errors.age && (
                <p className="text-red-500 text-sm mt-1">
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
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />
                {errors.password && (
                <p className="text-red-500 text-sm mt-1">
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
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-white"
                />
                {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition"
            >
                Register
            </button>
            </form>
            <p>Already Have an Account <Link to="/signin">Login</Link></p>
        </div>
        </div>
    );
};

export default Register;
