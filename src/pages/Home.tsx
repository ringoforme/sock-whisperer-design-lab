
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Star, Users, Layout, Mail, Phone } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">Sock Whisperer</h1>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-sock-purple transition-colors">Home</Link>
            <Link to="/design" className="text-gray-700 hover:text-sock-purple transition-colors">Design Lab</Link>
            <Link to="#features" className="text-gray-700 hover:text-sock-purple transition-colors">Features</Link>
            <Link to="#pricing" className="text-gray-700 hover:text-sock-purple transition-colors">Pricing</Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Log In</Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-sock-purple to-sock-dark-purple bg-clip-text text-transparent">
              Design Your Perfect Socks with AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create custom sock designs in seconds with our AI-powered platform. No design skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-sock-purple hover:bg-sock-dark-purple">
                <Link to="/design">Try Design Lab</Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 bg-sock-soft-blue p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <MessageSquare className="text-sock-purple h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Describe your perfect sock design in natural language and watch it come to life.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 bg-sock-soft-green p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Layout className="text-sock-purple h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Interactive Design</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fine-tune your designs with our interactive controls and see changes in real-time.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 bg-sock-soft-pink p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Star className="text-sock-purple h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trending Elements</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Stay on top of fashion trends with our curated design elements and color palettes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <Card className="border bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-sock-soft-blue flex items-center justify-center text-sock-purple font-bold">
                        JS
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Jane Smith</h4>
                      <p className="text-sm text-gray-500">Fashion Designer</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "I've never seen a tool that makes custom sock design so easy and fun. The AI understands exactly what I'm looking for!"
                  </p>
                  <div className="mt-4 flex">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="border bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-sock-soft-green flex items-center justify-center text-sock-purple font-bold">
                        MD
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Mike Davis</h4>
                      <p className="text-sm text-gray-500">Entrepreneur</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "We've created custom socks for our entire team using Sock Whisperer. The process was incredibly simple and the results were fantastic!"
                  </p>
                  <div className="mt-4 flex">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="border bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-sock-soft-orange flex items-center justify-center text-sock-purple font-bold">
                        CL
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold">Carlos Lee</h4>
                      <p className="text-sm text-gray-500">Student</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "I designed custom socks for my college club and everyone loved them! The AI suggestions were spot on with our club's aesthetic."
                  </p>
                  <div className="mt-4 flex">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section id="pricing" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <Card className="border relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sock-soft-blue text-sock-purple px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
                <CardContent className="pt-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">Basic</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>5 Sock Designs per month</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Basic Design Elements</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Export as JPG</span>
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border border-sock-purple shadow-lg">
                <CardContent className="pt-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>20 Sock Designs per month</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Advanced Design Elements</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Export as PNG & SVG</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Priority Support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-sock-purple hover:bg-sock-dark-purple">Get Started</Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border">
                <CardContent className="pt-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Unlimited Sock Designs</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Premium Design Elements</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>All Export Formats</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>API Access</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Dedicated Support</span>
                    </li>
                  </ul>
                  <Button className="w-full">Contact Sales</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-sock-purple mr-3" />
                    <span>hello@sockwhisperer.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-sock-purple mr-3" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-sock-purple mr-3" />
                    <span>Follow us on social media</span>
                  </div>
                </div>
                <div className="mt-6 flex space-x-4">
                  <a href="#" className="h-10 w-10 bg-sock-soft-blue rounded-full flex items-center justify-center text-sock-purple">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="#" className="h-10 w-10 bg-sock-soft-blue rounded-full flex items-center justify-center text-sock-purple">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="h-10 w-10 bg-sock-soft-blue rounded-full flex items-center justify-center text-sock-purple">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sock-purple focus:ring-sock-purple"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sock-purple focus:ring-sock-purple"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sock-purple focus:ring-sock-purple"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sock-purple focus:ring-sock-purple"
                    ></textarea>
                  </div>
                  <div>
                    <Button className="w-full">Send Message</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sock Whisperer</h3>
              <p className="text-gray-400">
                AI-powered custom sock design platform for everyone, from individuals to companies.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Sock Whisperer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
