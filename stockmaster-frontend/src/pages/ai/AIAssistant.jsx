import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am StockMaster AI. How can I help you with your inventory today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axiosClient.post('/ai/chat', { message: userMessage });
            const aiResponse = response.data.data.response;
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            toast.error('Failed to get AI response');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
                <p className="text-slate-600">Ask questions about your inventory and get smart insights.</p>
            </div>

            <div className="flex flex-1 flex-col rounded-lg bg-white shadow-sm border border-slate-100 overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                                    }`}>
                                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                </div>
                                <div className={`rounded-lg p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-800 shadow-sm border border-slate-100'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-700">{children}</p>,
                                                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                                                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                                                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                                    code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-slate-800">{children}</code>,
                                                    h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-base font-bold text-slate-900 mb-2">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-sm font-bold text-slate-900 mb-1">{children}</h3>,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-100 p-4 bg-white">
                    <form onSubmit={handleSend} className="flex space-x-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AI something..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send className="mr-2 h-4 w-4" />
                            Send
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
