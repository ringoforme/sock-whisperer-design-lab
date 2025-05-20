
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Book, Utensils, BarChart } from 'lucide-react';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // You could show a toast or update UI to indicate file selection
      console.log("File selected:", e.target.files[0].name);
    }
  };

  const handleAttachClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleCreateClick = () => {
    navigate('/design');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50">
      {/* Header */}
      <header className="py-4 px-4">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md mr-2"></div>
            <h1 className="text-2xl font-bold">Lovable</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>Log In</Button>
            <Button className="bg-black hover:bg-gray-800 text-white">Get started for free</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Chat Box */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Build something <span className="relative">
                <span>Lovable</span>
                <span className="absolute -right-12 top-0">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md"></div>
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12">
              Idea to app in seconds, with your personal full stack engineer
            </p>
            
            {/* Chat box mockup */}
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-12">
              <input 
                type="text" 
                placeholder="Ask Lovable to create a"
                className="w-full px-4 py-3 text-lg bg-transparent border-none focus:outline-none"
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <Button variant="outline" size="sm" onClick={handleAttachClick}>
                    {selectedFile ? `${selectedFile.name.slice(0, 15)}...` : "Attach"}
                  </Button>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2" 
                    onClick={handleCreateClick}
                  >
                    Create
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2">
                    Customized
                  </Button>
                  <Button size="sm" className="rounded-full aspect-square p-2 bg-gray-200">
                    <span className="sr-only">Send</span>
                    →
                  </Button>
                </div>
              </div>
            </div>
            
            {/* App buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <FileText className="h-4 w-4" />
                <span>File uploader</span>
              </Button>
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <Book className="h-4 w-4" />
                <span>Note taking app</span>
              </Button>
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <Utensils className="h-4 w-4" />
                <span>Recipe finder</span>
              </Button>
              <Button variant="outline" className="bg-white flex items-center gap-2 px-4 py-2 rounded-full">
                <BarChart className="h-4 w-4" />
                <span>Recharts dashboard</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Navigation link to the Design Lab */}
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to design your custom socks?</h2>
            <Button size="lg" className="bg-sock-purple hover:bg-sock-dark-purple">
              <Link to="/design">Go to Sock Design Lab</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© 2025 Sock Whisperer. Powered by Lovable.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
