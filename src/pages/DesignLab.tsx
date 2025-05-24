
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, File, Edit, PaperclipIcon, MessageSquare, Send } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';
import EditingView from '@/components/EditingView';

const DesignLab = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState(true);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'ai'}[]>([
    {text: "What kind of sock design would you like to create today?", sender: 'ai'}
  ]);
  const [designs, setDesigns] = useState<{id: number, imageUrl: string, isEditing?: boolean}[]>([
    {id: 1, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 2, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 3, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 4, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 5, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
    {id: 6, imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format'},
  ]);
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const location = useLocation();

  // Check if there's an initial prompt from the homepage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get('prompt');
    
    if (initialPrompt) {
      // Add user message with the initial prompt
      handleInitialPrompt(initialPrompt);
    }
  }, [location]);

  const handleInitialPrompt = (prompt: string) => {
    setMessages([
      ...messages,
      {text: prompt, sender: 'user' as const}
    ]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {text: "I understand your request. Let me create some sock designs for you.", sender: 'ai' as const}
      ]);
    }, 1000);
  };
  
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message to chat
    const newMessages = [...messages, {text: chatInput, sender: 'user' as const}];
    setMessages(newMessages);
    
    // Simulate AI response
    setTimeout(() => {
      if (chatMode) {
        setMessages([...newMessages, {
          text: "I understand your request. Let me think about how to help you with that design.", 
          sender: 'ai' as const
        }]);
      } else {
        setMessages([...newMessages, {
          text: "I've created some new sock designs based on your input. Check them out on the right!", 
          sender: 'ai' as const
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
      setMessages([...messages, {text: newMessage, sender: 'user' as const}]);
    }
  };

  const toggleChatMode = () => {
    setChatMode(!chatMode);
  };

  const handleDownload = (id: number) => {
    // In a real app, you'd implement the download functionality here
    console.log('Downloading design:', id);
    toast.success(`Downloading design #${id}`);
  };

  const handleVectorize = (id: number) => {
    // In a real app, you'd implement the vectorize functionality here
    console.log('Vectorizing design:', id);
    toast.success(`Vectorizing design #${id}`);
  };

  const handleEdit = (id: number) => {
    console.log('Editing design:', id);
    
    setSelectedDesign(id);
    setIsEditingMode(true);
    
    // Update the designs to highlight the selected one
    setDesigns(designs.map(design => ({
      ...design,
      isEditing: design.id === id
    })));
    
    // Add message to chat about editing this design
    setMessages(prev => [
      ...prev,
      {text: `I want to edit design #${id}. Can we make some changes to it?`, sender: 'user' as const}
    ]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {text: `Perfect! I'm now focused on design #${id}. What changes would you like to make? You can ask me to change colors, patterns, or any other aspects of this design.`, sender: 'ai' as const}
      ]);
    }, 800);
  };

  const handleExitEdit = () => {
    setIsEditingMode(false);
    setSelectedDesign(null);
    
    // Clear editing state from designs
    setDesigns(designs.map(design => ({
      ...design,
      isEditing: false
    })));
    
    // Add message about returning to overview
    setMessages(prev => [
      ...prev,
      {text: "Thanks for the editing session! I'm back to overview mode. Feel free to edit another design or create new ones.", sender: 'ai' as const}
    ]);
  };

  const handleSockDesignPrompt = (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, {text: message, sender: 'user' as const}]);
    
    // Simulate AI processing and response
    setTimeout(() => {
      // In a real app, you would process the message and generate/update designs
      setMessages(prev => [...prev, {
        text: isEditingMode && selectedDesign 
          ? `I've updated design #${selectedDesign} based on your request. You can see the changes in the preview.`
          : "I've created some sock designs based on your description!",
        sender: 'ai' as const
      }]);
    }, 1500);
  };

  const getSelectedDesignData = () => {
    return designs.find(design => design.id === selectedDesign);
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
          <div className="h-[80vh] flex flex-col border rounded-lg overflow-hidden">
            <ChatWindow onSendMessage={handleSockDesignPrompt} />
          </div>
          
          {/* Design Area - Dynamic based on editing mode */}
          <div className="h-[80vh] overflow-y-auto">
            {isEditingMode && selectedDesign && getSelectedDesignData() ? (
              <EditingView 
                design={getSelectedDesignData()!}
                onExitEdit={handleExitEdit}
                onDownload={handleDownload}
                onVectorize={handleVectorize}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {designs.map((design) => (
                  <Card 
                    key={design.id} 
                    className={`overflow-hidden transition-all ${design.isEditing ? 'ring-2 ring-sock-purple' : ''}`}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square relative">
                        <img 
                          src={design.imageUrl} 
                          alt={`Sock design ${design.id}`} 
                          className="w-full h-full object-cover"
                        />
                        {design.isEditing && (
                          <div className="absolute top-2 right-2 bg-sock-purple text-white text-xs px-2 py-1 rounded">
                            Editing
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-sm font-medium">Design #{design.id}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(design.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleVectorize(design.id)}>
                            <File className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={design.isEditing ? "default" : "ghost"} 
                            size="icon" 
                            onClick={() => handleEdit(design.id)}
                            className={design.isEditing ? "text-white bg-sock-purple" : ""}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
};

export default DesignLab;
