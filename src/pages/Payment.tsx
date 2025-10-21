import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Payment = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const upiId = "r.dhatshina2004@okicici";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePayNow = () => {
    if (isMobile) {
      // UPI payment link that opens UPI apps on mobile
      const upiLink = `upi://pay?pa=${upiId}&pn=Babu Advocates&cu=INR`;
      window.location.href = upiLink;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-legal-bg">
      {/* Header */}
      <header className="bg-legal-deep-blue shadow-elegant sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:text-justice-gold hover:bg-primary-foreground/10 transition-colors relative z-10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-primary-foreground">Payment</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-card overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-12">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-legal-deep-blue mb-3">
                  Make a Payment
                </h2>
                <p className="text-muted-foreground text-lg">
                  Scan the QR code below to pay via UPI
                </p>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-md lg:max-w-lg">
                  <img
                    src="https://supabaseforbabu.techverseinfo.tech/storage/v1/object/public/assets//upi%20image.png"
                    alt="UPI Payment QR Code"
                    className="w-full h-auto rounded-lg shadow-elegant"
                  />
                </div>
              </div>

              {/* UPI ID Display */}
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2">UPI ID</p>
                <p className="text-xl font-bold text-legal-deep-blue bg-muted px-4 py-3 rounded-lg inline-block">
                  {upiId}
                </p>
              </div>

              {/* Pay Now Button - Only active on mobile */}
              {isMobile && (
                <div className="flex justify-center mb-8">
                  <Button
                    onClick={handlePayNow}
                    size="lg"
                    className="bg-gradient-to-r from-justice-gold to-prestige-amber hover:from-prestige-amber hover:to-justice-gold text-legal-deep-blue font-bold text-lg px-8 py-6 shadow-glow"
                  >
                    <CreditCard className="h-6 w-6 mr-2" />
                    Pay Now
                  </Button>
                </div>
              )}

              {/* Desktop message */}
              {!isMobile && (
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">
                    Scan the QR code with your mobile UPI app to make a payment
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-bold text-center text-legal-deep-blue mb-6">
                  For Payment Confirmation
                </h3>
                
                <div className="space-y-4">
                  <Card className="bg-gradient-card border-justice-gold/30">
                    <CardContent className="p-4 flex items-center justify-center gap-3">
                      <Mail className="h-5 w-5 text-justice-gold" />
                      <a
                        href="mailto:babuadvocates@gmail.com"
                        className="text-legal-deep-blue font-semibold hover:text-justice-gold transition-colors"
                      >
                        babuadvocates@gmail.com
                      </a>
                    </CardContent>
                  </Card>

                  <p className="text-center text-sm text-muted-foreground">
                    Please send a message or email with your payment details for confirmation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Payment;
