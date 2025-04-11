import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'What is ZenGarden?',
      answer: 'ZenGarden is an online platform that helps you relax and manage your daily tasks effectively.',
    },
    {
      question: 'How do I report a bug?',
      answer: 'You can click on "Report a Bug" in the footer to send an email directly via Gmail.',
    },
    {
      question: 'Can I suggest a new feature?',
      answer: 'Yes, you can click on "Request a Feature" in the footer to submit your ideas via Google Form.',
    },
    {
      question: 'How can I contact you?',
      answer: 'You can send an email to nhatnlse161671@fpt.edu.vn or message us on Facebook at the Trung Tuấn page.',
    },
    // Các FAQ mới được bổ sung
    {
      question: 'Is ZenGarden free to use?',
      answer: 'Yes, ZenGarden offers a free version with core features. We also provide premium options for advanced functionalities.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page, click "Forgot Password," and follow the instructions sent to your email.',
    },
    {
      question: 'What devices are supported?',
      answer: 'ZenGarden is accessible on desktops, tablets, and mobile devices via web browsers.',
    },
    {
      question: 'How do I delete my account?',
      answer: 'To delete your account, please contact us at nhatnlse161671@fpt.edu.vn with your request.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 mt-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-[#609994] mb-10 text-center tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <Accordion type="single" collapsible className="space-y-4 bg-white rounded-lg shadow-md p-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-gray-200 last:border-b-0"
            >
              <AccordionTrigger
                className="text-left text-xl font-semibold text-[#609994] hover:text-[#f9af44] transition-colors duration-200 py-4"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-left pl-6 text-gray-700 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-flex items-center text-[#609994] hover:text-[#f9af44] text-lg font-medium transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}