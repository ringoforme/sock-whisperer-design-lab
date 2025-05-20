import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileVector, Edit } from 'lucide-react';

const Drafts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data for drafts
  const drafts = [
    {
      id: 1,
      name: "Summer Stripes",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-15T14:30:00"
    },
    {
      id: 2,
      name: "Geometric Pattern",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-14T10:15:00"
    },
    {
      id: 3,
      name: "Floral Design",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-13T16:45:00"
    },
    {
      id: 4,
      name: "Urban Style",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-11T09:20:00"
    },
    {
      id: 5,
      name: "Retro Dots",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-10T15:30:00"
    },
    {
      id: 6,
      name: "Abstract Art",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-09T11:40:00"
    },
    {
      id: 7,
      name: "Minimalist Design",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-08T14:20:00"
    },
    {
      id: 8,
      name: "Bold Colors",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      createdAt: "2025-05-07T10:10:00"
    }
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(drafts.length / itemsPerPage);
  
  const paginatedDrafts = drafts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (id: number) => {
    console.log('Editing draft:', id);
    // In a real app, you'd navigate to the design editor with this draft loaded
  };

  const handleDownload = (id: number) => {
    console.log('Downloading draft:', id);
    // In a real app, you'd implement download functionality
  };

  const handleVectorize = (id: number) => {
    console.log('Vectorizing draft:', id);
    // In a real app, you'd implement vectorize functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">SoxLab Drafts</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-sock-purple transition-colors">
              Home
            </Link>
            <Link to="/design" className="text-gray-700 hover:text-sock-purple transition-colors">
              Design Studio
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

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Design Drafts</h2>
          <Link to="/design">
            <Button className="bg-sock-purple hover:bg-sock-dark-purple">
              Create New Design
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList>
            <TabsTrigger value="all">All Drafts</TabsTrigger>
            <TabsTrigger value="recent">Recently Edited</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDrafts.map(draft => (
                <Card key={draft.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-0">
                    <div className="aspect-square relative">
                      <img 
                        src={draft.imageUrl} 
                        alt={draft.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{draft.name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(draft.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(draft.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(draft.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleVectorize(draft.id)}>
                        <FileVector className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button 
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-sock-purple hover:bg-sock-dark-purple" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDrafts.slice(0, 3).map(draft => (
                <Card key={draft.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-0">
                    <div className="aspect-square relative">
                      <img 
                        src={draft.imageUrl} 
                        alt={draft.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{draft.name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(draft.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(draft.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(draft.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleVectorize(draft.id)}>
                        <FileVector className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Drafts;
