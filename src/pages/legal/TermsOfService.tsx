
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 10, 2025</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement made between you and
                Enugu Waste Watch ("we," "us," or "our"), governing your access to and use of our mobile
                application and website (collectively, the "Service").
              </p>
              <p>
                By creating an account, accessing, or using the Service, you agree to be bound by these Terms.
                If you disagree with any part of these Terms, you may not access or use our Service.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <p className="mb-4">
                To access most features of the Service, you must register for an account. When registering,
                you agree to provide accurate, current, and complete information. You are responsible for
                safeguarding your account credentials and for all activities that occur under your account.
              </p>
              <p className="mb-4">
                You may register as one of the following user types:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Resident:</strong> Individual users who can report waste issues and view collection schedules.
                </li>
                <li>
                  <strong>Official:</strong> Government or waste management agency representatives who can manage reports
                  and update collection schedules.
                </li>
                <li>
                  <strong>Admin:</strong> System administrators with full access to all features and data.
                </li>
              </ul>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
              <p className="mb-4">
                When using our Service, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submit false or misleading waste reports</li>
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to other user accounts or system components</li>
                <li>Post defamatory, harassing, or threatening content</li>
                <li>Upload malicious code or attempt to interfere with the proper functioning of the Service</li>
                <li>Use automated means to access or collect data from the Service</li>
                <li>Impersonate another person or organization</li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate your account if we determine, in our sole discretion,
                that you have violated these acceptable use guidelines.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
              <p className="mb-4">
                Our Service allows you to submit waste reports, which may include descriptions, location data,
                and photos ("User Content"). You retain all rights to your User Content, but you grant us a
                worldwide, non-exclusive, royalty-free license to use, reproduce, and display your User Content
                for the purposes of operating and improving the Service.
              </p>
              <p>
                You represent and warrant that your User Content does not violate the rights of any third party
                and that you have all necessary rights to submit such content and grant us the license described above.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, in no event shall Enugu Waste Watch or its directors,
                employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from your access to or use of or
                inability to access or use the Service.
              </p>
              <p>
                We do not guarantee that waste issues reported through our Service will be resolved within
                any specific timeframe or at all, as the actual waste collection and management services
                are provided by third-party government agencies and private contractors.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Nigeria,
                without regard to its conflict of law provisions. Any dispute arising from these Terms
                shall be resolved exclusively in the courts located in Enugu State, Nigeria.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time at our sole discretion.
                If a revision is material, we will provide at least 30 days' notice prior to any new terms
                taking effect. What constitutes a material change will be determined at our sole discretion.
                By continuing to access or use our Service after any revisions become effective, you agree
                to be bound by the revised terms.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
                <br />
                <a href="mailto:info@enuguwaste.gov.ng" className="text-waste-green hover:underline">
                  info@enuguwaste.gov.ng
                </a>
              </p>
            </section>
            
            <Separator />
            
            <section className="pt-4">
              <p>
                By using our Service, you acknowledge that you have read these Terms of Service,
                understood them, and agree to be bound by them. Please also review our{" "}
                <Link to="/privacy" className="text-waste-green hover:underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
