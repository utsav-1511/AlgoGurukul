import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({problem,editorRef}) {
    const [messages, setMessages] = useState([
        { role: 'model', parts:[{text: "Hi, ask me anything about this problem."}]},

    ]);

    const { register, handleSubmit, reset,formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const nextMessages = [...messages, { role: 'user', parts:[{text: data.message}] }];
        
        setMessages(nextMessages);
        reset();

        try {
            
            const response = await axiosClient.post("/ai/chat", {
                message: data.message,
                messages: nextMessages.filter((msg) => msg.role === "user"),
                title:problem.title,
                description:problem.description,
                testCases: problem.visibleTestCases,
                startCode:problem.startCode,
                stuckedCode:editorRef.current.getValue()
            });

           
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            const status = error.response?.status;
            const message = error.response?.data?.message;
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: status ? `Chatbot error ${status}: ${message || "Request failed"}` : "Error from AI Chatbot"}]
            }]);
        }
    };

    return (
        <div className="flex h-screen min-h-[500px] max-h-[80vh] flex-col text-zinc-100">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                <div className="chat-bubble border border-zinc-700 bg-[#2d2d2a] text-zinc-100">
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 border-t border-zinc-700 bg-[#242421] p-4"
            >
                <div className="flex items-center">
                    <input 
                        placeholder="Ask me anything" 
                        className="input input-bordered flex-1 border-zinc-700 bg-[#2d2d2a] text-zinc-100 placeholder:text-zinc-500" 
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button 
                        type="submit" 
                        className="btn ml-2 border-zinc-700 bg-indigo-500 text-white hover:bg-indigo-400"
                        disabled={errors.message}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;
