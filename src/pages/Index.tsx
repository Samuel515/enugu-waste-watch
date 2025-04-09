
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Camera, MapPin, Calendar, AlertTriangle, Users } from "lucide-react";

const Index = () => {
  const features = [
    {
      title: "Real-time Waste Reporting",
      description: "Easily report waste issues with photos and location tagging",
      icon: <Camera className="h-6 w-6 text-waste-green" />,
    },
    {
      title: "Collection Schedule",
      description: "Stay informed about waste pickup times in your area",
      icon: <Calendar className="h-6 w-6 text-waste-blue" />,
    },
    {
      title: "Location Tracking",
      description: "GPS integration for precise reporting and tracking",
      icon: <MapPin className="h-6 w-6 text-waste-red" />,
    },
    {
      title: "Issue Alerts",
      description: "Receive notifications about waste management activities",
      icon: <AlertTriangle className="h-6 w-6 text-waste-yellow" />,
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create an Account",
      description: "Sign up as a resident, waste management official, or admin",
    },
    {
      number: "2",
      title: "Report Waste Issues",
      description: "Upload photos and location details of waste problems",
    },
    {
      number: "3",
      title: "Track Collection",
      description: "Monitor the status of your reports and waste pickup schedules",
    },
    {
      number: "4",
      title: "Receive Updates",
      description: "Get notifications when issues are resolved or pickups are scheduled",
    },
  ];

  const testimonials = [
    {
      quote: "This platform has revolutionized how we manage waste collection in Enugu. Real-time reporting has improved our efficiency by 40%.",
      author: "Dr. Chinedu Okeke",
      role: "Director, Enugu State Waste Management Authority",
    },
    {
      quote: "I love how easy it is to report waste issues in my neighborhood. The collection schedule notifications are also very helpful.",
      author: "Ada Nwosu",
      role: "Independence Layout Resident",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-waste-green/20 to-transparent">
        <div className="container px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-waste-green/30 bg-waste-green/10 text-waste-green mb-4">
                <span className="text-xs font-medium">Launching in Enugu State</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Smart Waste Management for a Cleaner Enugu
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Join our digital platform to report waste issues, track collections, and 
                help make Enugu cleaner and more sustainable.
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link to="/auth?tab=register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-waste-green/20 rounded-full blur-2xl z-0"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-waste-yellow/20 rounded-full blur-2xl z-0"></div>
                <div className="bg-white p-3 rounded-xl shadow-xl z-10 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                    alt="Waste management" 
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Our platform provides powerful tools to help manage waste efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="size-12 mb-4 flex items-center justify-center bg-waste-green/10 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Follow these simple steps to start using Enugu Waste Watch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="size-12 rounded-full bg-waste-green text-white flex items-center justify-center text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-waste-green text-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What People Say</h2>
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">
              Hear from our users and waste management authorities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex gap-2 mb-4 text-waste-yellow">
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-white/80">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Trash2 className="h-12 w-12 text-waste-green mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Join the Enugu Waste Watch Community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the solution to waste management challenges in Enugu State. 
              Report issues, track collections, and contribute to a cleaner environment.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild size="lg">
                <Link to="/auth?tab=register">
                  <Users className="mr-2 h-5 w-5" />
                  Sign Up Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
