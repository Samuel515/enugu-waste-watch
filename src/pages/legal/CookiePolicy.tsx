
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 10, 2025</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
              <p>
                Cookies are small pieces of text sent to your web browser when you visit a website.
                A cookie file is stored in your web browser and allows the Service or a third-party
                to recognize you and make your next visit easier and more useful to you.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">How Enugu Waste Watch Uses Cookies</h2>
              <p className="mb-4">
                When you use and access our Service, we may place a number of cookie files in your web browser. We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Essential cookies:</strong> These cookies are required for the operation of our Service.
                  They include, for example, cookies that enable you to log into secure areas of our website or use
                  our waste reporting features.
                </li>
                <li>
                  <strong>Preferences cookies:</strong> These cookies allow us to remember choices you make when
                  you use our Service, such as your login information or language preference. The purpose of these
                  cookies is to provide you with a more personal experience and to avoid you having to re-enter
                  your preferences every time you use our Service.
                </li>
                <li>
                  <strong>Analytics cookies:</strong> We use analytics cookies to track information about how the
                  Service is used so that we can make improvements. We also use analytics cookies to test new
                  features and to check visitor interaction with our features.
                </li>
              </ul>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage
                statistics of the Service, deliver advertisements on and through the Service, and so on.
                These may include cookies from service providers such as Google Analytics, Firebase, and
                other authentication providers.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Local Storage</h2>
              <p>
                In addition to cookies, we also use local storage technologies like localStorage and
                sessionStorage to store data. These technologies are similar to cookies but offer more
                storage capacity and aren't automatically transferred to the server with each request.
                We use local storage to enhance your user experience by storing preferences, authentication
                tokens, and other data needed for the Service to function properly.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">What Are Your Choices Regarding Cookies</h2>
              <p className="mb-4">
                If you'd like to delete cookies or instruct your web browser to delete or refuse cookies,
                please visit the help pages of your web browser. Please note, however, that if you delete
                cookies or refuse to accept them, you might not be able to use all of the features we offer,
                you may not be able to store your preferences, and some of our pages might not display properly.
              </p>
              <p className="mb-4">
                You can learn more about cookies and the following third-party websites:
              </p>
              <ul className="list-disc pl-6">
                <li>AllAboutCookies: <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-waste-green hover:underline">https://www.allaboutcookies.org/</a></li>
                <li>Network Advertising Initiative: <a href="https://www.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-waste-green hover:underline">https://www.networkadvertising.org/</a></li>
              </ul>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Cookie Policy</h2>
              <p>
                We may update our Cookie Policy from time to time. We will notify you of any changes by
                posting the new Cookie Policy on this page and updating the "Last updated" date at the
                top of this Cookie Policy. You are advised to review this Cookie Policy periodically
                for any changes.
              </p>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about our Cookie Policy, please contact us at:
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

export default CookiePolicy;
