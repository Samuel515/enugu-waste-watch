
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "What is Enugu Waste Watch?",
      answer: "Enugu Waste Watch is a digital platform designed to improve waste management in Enugu State. It allows residents to report waste issues, track collection schedules, and receive notifications about waste management activities."
    },
    {
      question: "How do I report a waste issue?",
      answer: "After signing up and logging in, navigate to the 'Report Waste' page. Fill out the form with details about the waste issue, upload photos if possible, and provide the location. Your report will be submitted to waste management officials for action."
    },
    {
      question: "How will I know when waste collection will happen in my area?",
      answer: "On the 'Pickup Schedule' page, you can view the collection schedule for your area. You can also opt to receive notifications before scheduled pickups."
    },
    {
      question: "Who can use Enugu Waste Watch?",
      answer: "The platform is designed for all stakeholders in Enugu State's waste management system. Residents can report issues and check schedules, waste management officials can manage reports and update schedules, and administrators can oversee the entire system."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take data security seriously. Your personal information is encrypted and stored securely. We only collect the information necessary to provide the service and improve waste management."
    },
    {
      question: "How can I change my account details?",
      answer: "You can update your profile information by navigating to the 'Profile' page after logging in. From there, you can edit your name, contact information, and area."
    },
    {
      question: "Can I use Enugu Waste Watch on my mobile phone?",
      answer: "Yes, the platform is fully responsive and works on mobile phones, tablets, and desktop computers."
    },
    {
      question: "What types of waste issues can I report?",
      answer: "You can report various issues such as illegal dumping, missed collections, overflowing public bins, and littering. The more details and photos you provide, the better officials can respond."
    },
    {
      question: "How long will it take for officials to address my reported issue?",
      answer: "Response times vary depending on the severity of the issue and available resources. You will receive updates on your report's status through the platform."
    },
    {
      question: "Is there a cost to use Enugu Waste Watch?",
      answer: "No, the platform is free for all users. It is funded by the Enugu State government as part of its initiative to improve waste management services."
    },
    {
      question: "Can I see the status of issues I've reported?",
      answer: "Yes, you can track all your reports on the dashboard. Each report will show its current status: submitted, under review, in progress, resolved, or closed."
    },
    {
      question: "How can I provide feedback about the platform?",
      answer: "You can provide feedback through the 'Contact' section or by emailing info@enuguwaste.gov.ng. We value your input as we continually work to improve the platform."
    }
  ];
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about Enugu Waste Watch
          </p>
          
          <div className="relative mb-8">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No FAQs match your search. Try different keywords.</p>
            </div>
          )}
          
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground">
              If you couldn't find the answer you were looking for, feel free to contact us:
            </p>
            <div className="mt-3">
              <a 
                href="mailto:info@enuguwaste.gov.ng" 
                className="text-waste-green hover:underline font-medium"
              >
                info@enuguwaste.gov.ng
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
