"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FAQAccordion, { FAQ } from "@/components/FAQAccordion";

const aboutContent = {
  description:
    "Welcome to My Quiz App – a platform designed to make learning fun and engaging through a variety of quizzes on different topics.",
  developerInfo:
    "Developed and maintained by [Your Name]. Passionate about creating bug-free, production-grade applications using modern web technologies.",
  userCapabilities:
    "Users can take quizzes, view available quizzes on the home page, and manage their account settings such as theme and quiz result saving preferences.",
  limitations:
    "Access to certain features may be restricted to registered users. Additionally, quiz attempts and results might be saved only if the user opts in via account settings.",
};

const faqs: FAQ[] = [
  {
    question: "What is My Quiz App?",
    answer:
      "My Quiz App is an interactive platform where you can test your knowledge with quizzes featuring multiple-choice questions.",
  },
  {
    question: "How do I register or login?",
    answer:
      "Simply navigate to the login or registration page. The forms are designed with security and usability in mind.",
  },
  {
    question: "Can I save my quiz results?",
    answer:
      "Yes, users can choose to save their quiz results through the account settings. This option helps you track your progress over time.",
  },
  {
    question: "What kind of quizzes are available?",
    answer:
      "The app offers quizzes with options limited to A-D answers, focusing on a streamlined and easy-to-understand format.",
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* About Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">About My Quiz App</CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <p>{aboutContent.description}</p>
          <div>
            <h3 className="font-semibold">Developer / Owner Info:</h3>
            <p>{aboutContent.developerInfo}</p>
          </div>
          <div>
            <h3 className="font-semibold">What Users Can Do:</h3>
            <p>{aboutContent.userCapabilities}</p>
          </div>
          <div>
            <h3 className="font-semibold">Limitations:</h3>
            <p>{aboutContent.limitations}</p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <FAQAccordion faqs={faqs} />
      </div>
    </div>
  );
};

export default AboutPage;
