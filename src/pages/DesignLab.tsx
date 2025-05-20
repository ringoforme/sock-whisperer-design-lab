
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, Vector, Edit, PaperclipIcon, MessageSquare, Send } from 'lucide-react';

const DesignLab = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState(true);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'ai'}[]>([
    {text: "What kind of sock design would you like to create today?", sender: 'ai'}
  ]);
  const [designs, setDesigns] = useState<{id: number, imageUrl: string}[]>([
    {id: 1, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 2, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 3, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 4, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 5, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 6, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
  ]);
  
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message to chat
    const newMessages = [...messages, {text: chatInput, sender: 'user'}];
    setMessages(newMessages);
    
    // Simulate AI response
    setTimeout(() => {
      if (chatMode) {
        setMessages([...newMessages, {
          text: "I understand your request. Let me think about how to help you with that design.", 
          sender: 'ai'
        }]);
      } else {
        setMessages([...newMessages, {
          text: "I've created some new sock designs based on your input. Check them out on the right!", 
          sender: 'ai'
        }]);
        // In a real app, you'd generate new designs here
      }
    }, 1000);
    
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you'd handle the file upload here
      const newMessage = `Uploaded file: ${e.target.files[0].name}`;
      setMessages([...messages, {text: newMessage, sender: 'user'}]);
    }
  };

  const toggleChatMode = () => {
    setChatMode(!chatMode);
  };

  const handleDownload = (id: number) => {
    // In a real app, you'd implement the download functionality here
    console.log('Downloading design:', id);
  };

  const handleVectorize = (id: number) => {
    // In a real app, you'd implement the vectorize functionality here
    console.log('Vectorizing design:', id);
  };

  const handleEdit = (id: number) => {
    // In a real app, you'd load the selected design for editing
    console.log('Editing design:', id);
    setMessages([...messages, {
      text: `I want to edit design #${id}. Can we make some changes to it?`, 
      sender: 'user'
    }]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">SoxLab Design Studio</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/drafts" className="text-gray-700 hover:text-sock-purple transition-colors">
              Drafts
            </Link>
            <Link to="/profile" className="ml-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Chat Area */}
          <div className="h-[80vh] flex flex-col border rounded-lg bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex items-center space-x-2 mb-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <PaperclipIcon className="h-5 w-5 text-gray-500 hover:text-sock-purple" />
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleChatMode}
                  className={chatMode ? "text-sock-purple" : "text-gray-500"}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                  <textarea
                    className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-sock-purple resize-none"
                    placeholder={chatMode ? "Chat with AI about your design..." : "Describe the sock design you want..."}
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Designs Area */}
          <div className="h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {designs.map((design) => (
                <Card key={design.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img 
                        src={design.imageUrl} 
                        alt={`Sock design ${design.id}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-sm font-medium">Design #{design.id}</span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(design.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleVectorize(design.id)}>
                          <Vector className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(design.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
};

export default DesignLab;
