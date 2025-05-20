import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, File, Edit } from 'lucide-react';

const Drafts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState("all");
  const [drafts, setDrafts] = useState([
    {
      id: 1,
      title: "Red Stripes Pattern",
      createdAt: "2025-05-12T10:30:00Z",
      imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format",
      type: "Pattern"
    },
    {
      id: 2,
      title: "Blue Geometric Texture",
      createdAt: "2025-05-10T14:00:00Z",
      imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format",
      type: "Texture"
    },
    {
      id: 3,
      title: "Green Abstract Color Scheme",
      createdAt: "2025-05-05T18:45:00Z",
      imageUrl: "https://images.unsplash.com/photo-1575936123452-d666ca386bbb?w=500&auto=format",
      type: "Color"
    },
    {
      id: 4,
      title: "Yellow Floral Pattern",
      createdAt: "2025-04-28T09:15:00Z",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560ba3e51c?w=500&auto=format",
      type: "Pattern"
    },
    {
      id: 5,
      title: "Orange Animal Texture",
      createdAt: "2025-04-20T16:20:00Z",
      imageUrl: "https://images.unsplash.com/photo-1568602471122-78329514c2f2?w=500&auto=format",
      type: "Texture"
    },
    {
      id: 6,
      title: "Pink Polka Dots Color Scheme",
      createdAt: "2025-04-15T11:55:00Z",
      imageUrl: "https://images.unsplash.com/photo-1563245377-b5725c33873a?w=500&auto=format",
      type: "Color"
    }
  ]);
  
  const handleEdit = (id: number) => {
    console.log('Editing draft:', id);
    // In a real app, you'd redirect to the design page with the draft loaded
  };
  
  const handleDownload = (id: number) => {
    console.log('Downloading draft:', id);
    // In a real app, you'd implement download functionality
  };
  
  const handleVectorize = (id: number) => {
    console.log('Vectorizing draft:', id);
    // In a real app, you'd implement vectorizing functionality
  };
  
  const handleDeleteDraft = (id: number) => {
    // In a real app, you'd call an API to delete the draft
    console.log('Deleting draft:', id);
    setDrafts(drafts.filter(draft => draft.id !== id));
  };
  
  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const handleChangeTab = (tab: string) => {
    setCurrentTab(tab);
  };
  
  const filteredDrafts = currentTab === "all" 
    ? drafts 
    : drafts.filter(draft => draft.type.toLowerCase() === currentTab.toLowerCase());
  
  const draftsPerPage = 6;
  const totalPages = Math.ceil(filteredDrafts.length / draftsPerPage);
  const startIndex = (currentPage - 1) * draftsPerPage;
  const endIndex = startIndex + draftsPerPage;
  const draftsToDisplay = filteredDrafts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">SoxLab Drafts</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/design" className="text-gray-700 hover:text-sock-purple transition-colors">
              Design Lab
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
        <div className="flex flex-col space-y-8">
          <Tabs defaultValue="all" className="w-full" onValueChange={handleChangeTab}>
            <TabsList>
              <TabsTrigger value="all">All Drafts</TabsTrigger>
              <TabsTrigger value="pattern">Patterns</TabsTrigger>
              <TabsTrigger value="texture">Textures</TabsTrigger>
              <TabsTrigger value="color">Color Schemes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftsToDisplay.map((draft) => (
                  <Card key={draft.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{draft.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative aspect-video">
                        <img 
                          src={draft.imageUrl} 
                          alt={draft.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mt-3">
                          Created: {new Date(draft.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => handleEdit(draft.id)}
                        className="text-sock-purple border-sock-purple hover:bg-sock-light-purple"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(draft.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleVectorize(draft.id)}>
                          <File className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handleChangePage(currentPage - 1)}
                  className="mr-2"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handleChangePage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="pattern" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftsToDisplay
                  .filter((draft) => draft.type.toLowerCase() === "pattern")
                  .map((draft) => (
                    <Card key={draft.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{draft.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <img
                            src={draft.imageUrl}
                            alt={draft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground mt-3">
                            Created: {new Date(draft.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(draft.id)}
                          className="text-sock-purple border-sock-purple hover:bg-sock-light-purple"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(draft.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleVectorize(draft.id)}>
                            <File className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="texture" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftsToDisplay
                  .filter((draft) => draft.type.toLowerCase() === "texture")
                  .map((draft) => (
                    <Card key={draft.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{draft.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <img
                            src={draft.imageUrl}
                            alt={draft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground mt-3">
                            Created: {new Date(draft.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(draft.id)}
                          className="text-sock-purple border-sock-purple hover:bg-sock-light-purple"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(draft.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleVectorize(draft.id)}>
                            <File className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="color" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftsToDisplay
                  .filter((draft) => draft.type.toLowerCase() === "color")
                  .map((draft) => (
                    <Card key={draft.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{draft.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <img
                            src={draft.imageUrl}
                            alt={draft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground mt-3">
                            Created: {new Date(draft.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(draft.id)}
                          className="text-sock-purple border-sock-purple hover:bg-sock-light-purple"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(draft.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleVectorize(draft.id)}>
                            <File className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Drafts;
