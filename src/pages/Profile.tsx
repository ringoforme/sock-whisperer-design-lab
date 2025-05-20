
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">SoxLab Profile</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-sock-purple transition-colors">
              Home
            </Link>
            <Link to="/drafts" className="text-gray-700 hover:text-sock-purple transition-colors">
              Drafts
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <p className="text-sm text-gray-500">user@example.com</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>John Doe</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>user@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p>May 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subscription</p>
                    <p>Premium</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-sock-purple">8</p>
                      <p className="text-sm text-gray-500">Designs Created</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-sock-purple">3</p>
                      <p className="text-sm text-gray-500">Downloaded</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-sock-purple">2</p>
                      <p className="text-sm text-gray-500">Vectorized</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">Edit Profile</Button>
                <Button className="bg-sock-purple hover:bg-sock-dark-purple">Upgrade Plan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
