
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 10, 2025</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="mb-4">
                Enugu Waste Watch is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our mobile application and website (collectively, the "Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Service, you
                acknowledge that you have read, understood, and agree to be bound by all the terms
                of this Privacy Policy.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="mb-4">
                We may collect several types of information from and about users of our Service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Personal Information:</strong> This includes your name, email address, telephone number,
                  residential address, and any other information you provide when creating an account or
                  submitting waste reports.
                </li>
                <li>
                  <strong>Location Data:</strong> With your consent, we collect precise location data to help
                  you accurately report waste issues and receive collection schedule updates relevant to your area.
                </li>
                <li>
                  <strong>Device Information:</strong> We may collect information about your mobile device and
                  internet connection, including the device's unique device identifier, IP address, operating
                  system, browser type, and mobile network information.
                </li>
                <li>
                  <strong>Usage Data:</strong> We collect information about how you use our Service, such as
                  the features you access, the time and duration of your visits, and other actions you take
                  while using the app.
                </li>
              </ul>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-4">
                We may use the information we collect about you for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and improving the Service</li>
                <li>Processing and managing waste reports</li>
                <li>Sending notifications about waste collection schedules</li>
                <li>Responding to your inquiries and customer service requests</li>
                <li>Sending administrative emails related to your account</li>
                <li>Analyzing usage patterns to improve the user experience</li>
                <li>Protecting the security and integrity of our Service</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
              <p className="mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>With Service Providers:</strong> We may share your information with third-party
                  vendors, consultants, and other service providers who need access to such information
                  to carry out work on our behalf.
                </li>
                <li>
                  <strong>With Government Authorities:</strong> Since our Service is designed to assist with
                  waste management in Enugu State, we may share waste report data with relevant government
                  authorities and waste management agencies to address reported issues.
                </li>
                <li>
                  <strong>For Legal Reasons:</strong> We may disclose your information if required to do so by
                  law or in response to valid requests by public authorities (e.g., a court or a government agency).
                </li>
                <li>
                  <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of
                  all or a portion of our assets, your information may be transferred as part of that transaction.
                </li>
              </ul>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:info@enuguwaste.gov.ng" className="text-waste-green hover:underline">
                  info@enuguwaste.gov.ng
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
