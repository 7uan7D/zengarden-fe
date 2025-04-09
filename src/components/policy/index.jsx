// src/pages/common/Policy.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Policy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header sẽ được hiển thị từ App.js */}
      <div className="flex-1 pt-[80px] px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Welcome to ZenGarden! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the application.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">
                We may collect the following information:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Personal Information: Name, email address, phone number.</li>
                <li>Usage Data: Information about how you use the app, such as tasks completed and time spent.</li>
                <li>Device Information: IP address, browser type, and device identifiers.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Provide and improve our services.</li>
                <li>Personalize your experience in ZenGarden.</li>
                <li>Communicate with you, including sending updates and notifications.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">4. Sharing Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We do not share your personal information with third parties except:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>With your consent.</li>
                <li>To comply with legal obligations.</li>
                <li>With service providers acting on our behalf.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">5. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at:{" "}
                <a href="mailto:support@zengarden.com" className="text-green-600 hover:underline">
                  support@zengarden.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Footer sẽ được hiển thị từ App.js */}
    </div>
  );
}