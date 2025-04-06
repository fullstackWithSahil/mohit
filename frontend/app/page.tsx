"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Youtube, Send } from "lucide-react";
import VideoCard from "./VideoCard";
import Summary from "./components/Summary";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";



export default function Page() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearCommentsloading, setclearCommentsLoading] = useState(true);
  const [removeCommentsloading, setRemoveCommentsLoading] = useState(true);
  const [summerizeCommentsloading, setSummerizeCommentsLoading] = useState(true);
  const [indexCommentsloading, setIndexCommentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [comments, setComments] = useState([""]);
  const [steps, setSteps] = useState(0);
  
  // Chat interface state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if(steps === 1){
      filterComments();
    }
    if(steps === 2){
      removeComments();
    }
    if(steps === 3){
      summerizeComments();
    }
    console.log({summary});
    if(steps === 4){
      indexComments();
    }
  }, [steps]);
  
  async function filterComments(){
    const {data} = await axios.post("http://localhost:8080/filterComments", {comments});
    setComments(data.relevant);
    setclearCommentsLoading(false);
    setSteps(prev => prev + 1);
  }
  
  async function removeComments(){
    const {data} = await axios.post("http://localhost:8080/removeComments", {comments});
    setComments(data.comments);
    setRemoveCommentsLoading(false);
    setSteps(prev => prev + 1);
  }
  
  async function summerizeComments(){
    const {data} = await axios.post("http://localhost:8080/summarizeComments", {query, comments});
    setSummary(data.summary);
    console.log({returned: data.summary});
    setSummerizeCommentsLoading(false);
    setSteps(prev => prev + 1);
  }
  
  async function indexComments(){
    const {data} = await axios.post("http://localhost:8080/indexing", {comments});
    setIndexCommentsLoading(false);
    setSteps(prev => prev + 1);
  }
  
  async function handleSearch() {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        "http://localhost:5000/api/youtubevideos",
        {
          query: query,
          maxResults: 10,
        }
      );
      setData(response.data);
      console.log(response.data);
      const allComments = response.data.flatMap(video => video.comments);
      setComments(allComments);
      setSteps(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setError("Error fetching videos. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle sending a chat message
  async function handleSendMessage() {
    if (!chatMessage.trim()) return;
    
    // Add user message to chat history
    const userMessage = { role: "user", content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    
    // Clear input and set loading state
    setChatMessage("");
    setChatLoading(true);
    
    try {
      // Send query to backend
      const response = await axios.post("http://localhost:8080/query", {
        question: chatMessage,
        query,
        comments
      });
      
      // Create AI response with retrieved context
      const aiResponse = { 
        role: "assistant", 
        content:response.data.response? 
          `Based on the video content: ${response.data.response}` : 
          "I don't have enough information about that from the videos."
      };
      
      // Add AI response to chat history
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error querying AI:", error);
      
      // Add error message to chat history
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error while processing your question." 
      }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <main className="flex flex-col">
      {/* Search section */}
      <div className="m-5 p-4 border-2 rounded-2xl">
        <h1 className="text-xl font-bold mb-4">Topic for your YouTube video</h1>
        <div className="grid grid-cols-4 gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="col-span-3"
            placeholder="Enter search query..."
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
      
      {/* Video results section */}
      <div>
        <div className="flex items-center m-5 p-4 border-2 rounded-2xl gap-4">
          <Youtube />
          {loading ? (
            <p>Searching YouTube...</p>
          ) : (
            <p>{query ? `Results for "${query}"` : "Enter a search query"}</p>
          )}
        </div>
        {error && <p className="text-red-500 mx-5">{error}</p>}
        <div>
          {data?.map((video) => (
            <VideoCard 
              key={video.url} 
              video={video} 
              Removing={removeCommentsloading} 
              Clearing={clearCommentsloading}
              Indexing={indexCommentsloading}
              Summerizing={summerizeCommentsloading}
            />
          ))}
        </div>
      </div>
      
      {/* Summary section */}
      {summary && (
        <div className="m-5">
          <Summary summary={summary} />
        </div>
      )}
      
      {/* Chat interface - Now appears after the summary */}
      {summary && !indexCommentsloading && (
        <div className="m-5 border-2 rounded-2xl overflow-hidden">
          <div className="p-4 border-b-2 bg-gray-50">
            <h2 className="text-lg font-bold">Ask Questions About the Videos</h2>
            <p className="text-sm text-gray-500">Chat with AI about the content and insights</p>
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 h-96 overflow-y-auto space-y-4">
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Start a conversation about these videos!</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg max-w-3/4 ${
                    msg.role === "user" 
                      ? "bg-blue-100 ml-auto" 
                      : "bg-gray-100 mr-auto"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                  </ReactMarkdown>
                </div>
              ))
            )}
            
            {chatLoading && (
              <div className="bg-gray-100 p-3 rounded-lg mr-auto animate-pulse">
                Thinking...
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t-2">
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about the videos..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={chatLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={chatLoading}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}