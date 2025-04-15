
import Layout from "@/components/layout/Layout";
import { Trash2, BarChart2, Recycle, Users, CheckCircle, AlertTriangle } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">About Waste Management in Enugu State</h1>
          
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <h2 className="flex items-center gap-2 text-waste-green">
              <Trash2 className="h-6 w-6" />
              Current State of Waste Management
            </h2>
            
            <p>
              Enugu State, like many rapidly developing regions in Nigeria, faces significant challenges in waste management. 
              The state generates approximately 1,500-1,800 tons of municipal solid waste daily, with collection rates 
              hovering around 60%. The Enugu State Waste Management Authority (ESWAMA) is responsible for waste collection 
              and disposal, but it struggles with limited resources, outdated equipment, and growing population demands.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-waste-red" />
                  Key Challenges
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Irregular waste collection schedules in many neighborhoods</li>
                  <li>Insufficient waste bins and collection points</li>
                  <li>Limited recycling infrastructure and programs</li>
                  <li>Illegal dumping in unauthorized locations</li>
                  <li>Lack of real-time reporting mechanisms for waste issues</li>
                  <li>Low public awareness about proper waste disposal</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-waste-blue" />
                  Key Statistics
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span>Daily waste generation:</span>
                    <span className="font-medium">1,500-1,800 tons</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Collection rate:</span>
                    <span className="font-medium">~60%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Recycling rate:</span>
                    <span className="font-medium">Under 10%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Approved dumpsites:</span>
                    <span className="font-medium">3 major sites</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Collection vehicles:</span>
                    <span className="font-medium">~45</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <h2 className="flex items-center gap-2 text-waste-green mt-10">
              <Recycle className="h-6 w-6" />
              Vision for Improved Waste Management
            </h2>
            
            <p>
              The Enugu Waste Watch platform is designed to revolutionize waste management in Enugu State by leveraging digital 
              technology and community participation. Our vision is to create a cleaner, healthier, and more sustainable environment 
              through efficient waste collection, proper disposal, and increased recycling initiatives.
            </p>
            
            <h3 className="font-medium text-xl mt-6 mb-4">How We're Making a Difference</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-waste-green" />
                </div>
                <div>
                  <h4 className="font-medium">Real-time Reporting</h4>
                  <p className="text-muted-foreground">
                    Enabling residents to report waste issues with photos and location data, creating accountability and faster response times.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-waste-green" />
                </div>
                <div>
                  <h4 className="font-medium">Transparent Scheduling</h4>
                  <p className="text-muted-foreground">
                    Publishing collection schedules and sending notifications to ensure residents know when to expect waste pickup.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-waste-green" />
                </div>
                <div>
                  <h4 className="font-medium">Data-driven Management</h4>
                  <p className="text-muted-foreground">
                    Collecting and analyzing waste management data to optimize routes, resource allocation, and identify problem areas.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-waste-green" />
                </div>
                <div>
                  <h4 className="font-medium">Community Engagement</h4>
                  <p className="text-muted-foreground">
                    Creating a platform for dialogue between residents, waste management officials, and policymakers.
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="flex items-center gap-2 text-waste-green mt-10">
              <Users className="h-6 w-6" />
              Join the Movement
            </h2>
            
            <p>
              We invite all Enugu residents, businesses, waste management professionals, and policymakers to join the Enugu Waste Watch 
              platform. By working together, we can transform waste management in our state and create a model for other regions to follow.
            </p>
            
            <p>
              Sign up today to report waste issues, receive collection notifications, and be part of the solution. Together, we can make 
              Enugu cleaner, healthier, and more sustainable for present and future generations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
