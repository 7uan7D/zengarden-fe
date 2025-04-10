import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'ZenGarden là gì?',
      answer: 'ZenGarden là một nền tảng trực tuyến giúp bạn thư giãn và quản lý công việc hàng ngày một cách hiệu quả.',
    },
    {
      question: 'Làm thế nào để báo lỗi (Report a Bug)?',
      answer: 'Bạn có thể nhấp vào "Report a Bug" trong footer để gửi email báo lỗi trực tiếp qua Gmail.',
    },
    {
      question: 'Tôi có thể đề xuất tính năng mới không?',
      answer: 'Có, bạn có thể nhấp vào "Request a Feature" trong footer để gửi ý tưởng qua Google Form.',
    },
    {
      question: 'Liên hệ với chúng tôi qua đâu?',
      answer: 'Bạn có thể gửi email đến nhatnlse161671@fpt.edu.vn hoặc nhắn tin qua Facebook tại trang Trung Tuấn.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-7 mt-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#609994] mb-8 text-center">
          Frequently Asked Questions (FAQ)
        </h1>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-none shadow-none" // Loại bỏ viền và shadow của item
            >
              <AccordionTrigger
                className="text-left text-lg font-semibold duration-200 border-none"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-left pl-5 text-sm border-none">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-[#609994] hover:text-[#f9af44] transition-colors duration-200"
          >
            Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}