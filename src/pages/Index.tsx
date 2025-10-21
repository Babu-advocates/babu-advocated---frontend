import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Building2, Shield, Users, ArrowRight, BookOpen, Gavel, FileText, Award, Phone, Mail, MapPin, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";
import advocateOffice from "@/assets/lawyer-office-interior.png";
import { useState, useEffect } from "react";
import { WordPullUp } from "@/components/ui/word-pull-up";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('babu_splash_v2');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('babu_splash_v2', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  return <div className="min-h-screen bg-gradient-legal-bg">
      {/* Enhanced Professional Header with Navigation */}
      <header className="bg-legal-deep-blue shadow-elegant sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Scale className="h-9 w-9 text-justice-gold animate-pulse-slow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-justice-gold rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">Babu Advocates</h1>
                <p className="text-xs text-justice-gold font-medium">Professional Legal Services</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="nav" size="sm" className="px-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Home
              </Button>
              <Button variant="nav" size="sm" className="px-4" onClick={() => document.getElementById('about-us')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                About Us
              </Button>
              <Button variant="nav" size="sm" className="px-4" onClick={() => document.getElementById('contact')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                Contact Us
              </Button>
              <Link to="/payment">
                <Button variant="nav" size="sm" className="px-4">
                  Payment
                </Button>
              </Link>
              <div className="ml-4 pl-4 border-l border-primary-foreground/20">
                <span className="text-sm text-justice-gold font-semibold">
                  🏛️ Secure Case Management Platform
                </span>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <Button variant="nav" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && <div className="md:hidden mt-4 pb-4 border-t border-primary-foreground/20 animate-fade-in">
              <nav className="flex flex-col space-y-2 mt-4">
                <Button variant="nav" size="sm" className="justify-start" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }}>
                  Home
                </Button>
                <Button variant="nav" size="sm" className="justify-start" onClick={() => {
              document.getElementById('about-us')?.scrollIntoView({
                behavior: 'smooth'
              });
              setIsMobileMenuOpen(false);
            }}>
                  About Us
                </Button>
                <Button variant="nav" size="sm" className="justify-start" onClick={() => {
              document.getElementById('contact')?.scrollIntoView({
                behavior: 'smooth'
              });
              setIsMobileMenuOpen(false);
            }}>
                  Contact Us
                </Button>
                <Link to="/payment">
                  <Button variant="nav" size="sm" className="justify-start w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    Payment
                  </Button>
                </Link>
              </nav>
            </div>}
        </div>
      </header>

      {/* Enhanced Hero Section with Law Elements - Landing Page Design */}
      <section className="relative py-8 sm:py-12 overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{
        backgroundImage: `url(${heroBackground})`
      }} />
        
        {/* Floating Legal Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <Gavel className="absolute top-20 left-10 h-16 w-16 text-justice-gold/20 animate-float-slow" />
          <BookOpen className="absolute top-40 right-20 h-12 w-12 text-court-purple/20 animate-float-reverse" />
          <FileText className="absolute bottom-40 left-20 h-14 w-14 text-legal-deep-blue/20 animate-pulse-slow" />
          <Award className="absolute bottom-20 right-10 h-10 w-10 text-prestige-amber/20 animate-spin-slow" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Desktop: Two column layout, Mobile: Stacked */}
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center max-w-7xl mx-auto">
            
            {/* Left Side: Welcome Content */}
            <div className="text-center lg:text-left space-y-4 md:space-y-6">
              {/* Central Legal Icons - Always centered */}
              <div className="animate-fade-in flex justify-center">
                <div className="inline-flex items-center gap-2 sm:gap-4 bg-gradient-prestige p-3 sm:p-4 md:p-6 shadow-elegant rounded-lg">
                  <Scale className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-legal-deep-blue animate-3d-text" />
                  <Gavel className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-legal-deep-blue" />
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-legal-deep-blue" />
                </div>
              </div>
              
              {/* Main Heading with WordPullUp Animation */}
              <div className="space-y-3 md:space-y-4">
                <WordPullUp words="WELCOME TO BABU ADVOCATES" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-legal-deep-blue uppercase tracking-wide" wrapperFramerProps={{
                hidden: {
                  opacity: 0
                },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    delayChildren: 0.1,
                    repeat: Infinity,
                    repeatDelay: 5,
                    repeatType: "loop"
                  }
                }
              }} framerProps={{
                hidden: {
                  y: 40,
                  opacity: 0,
                  scale: 0.8
                },
                show: {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    duration: 1.2
                  }
                }
              }} />
                {/* YOUR LEGAL DOCTOR - Always centered */}
                <div className="flex justify-center">
                  <div className="inline-block bg-black rounded-xl md:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 md:p-4">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-gradient-to-r from-justice-gold via-prestige-amber to-justice-gold bg-clip-text uppercase tracking-wider">
                      YOUR LEGAL DOCTOR
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subtitle */}
              <p className="text-muted-foreground leading-relaxed animate-fade-in text-sm sm:text-base font-medium lg:pr-8 px-2 sm:px-0">
                A professional platform designed to streamline communication and case 
                management between legal advocates and banking institutions with 
                enterprise-grade security and compliance standards.
              </p>
            </div>

            {/* Right Side: Portal Cards */}
            <div className="space-y-4 md:space-y-6">
              {/* Advocate Portal Card */}
              <Card className="bg-gradient-card shadow-elegant transition-all duration-500 border-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-justice opacity-5"></div>
                <CardContent className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                    <div className="relative">
                      <div className="p-3 sm:p-4 bg-gradient-law-firm rounded-full shadow-glow">
                        <Scale className="h-10 w-10 sm:h-12 sm:w-12 text-justice-gold" />
                      </div>
                      <div className="absolute -top-1 -right-1 p-1 bg-justice-gold rounded-full animate-pulse">
                        <Gavel className="h-3 w-3 sm:h-4 sm:w-4 text-legal-deep-blue" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-primary text-center sm:text-left">
                      Advocate Portal
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4 text-xs sm:text-sm text-center sm:text-left">
                    Access your legal cases, manage client communications, and track case progress with professional legal tools
                  </p>
                  <Link to="/advocate-login">
                    <Button variant="advocate" size="lg" className="w-full text-sm sm:text-base">
                      Enter Portal
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Banking Portal Card */}
              <Card className="bg-gradient-card shadow-elegant transition-all duration-500 border-accent/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-prestige opacity-5 transition-opacity"></div>
                <CardContent className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                    <div className="relative">
                      <div className="p-3 sm:p-4 bg-gradient-corporate rounded-full shadow-glow">
                        <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-prestige-amber" />
                      </div>
                      <div className="absolute -top-1 -right-1 p-1 bg-prestige-amber rounded-full animate-pulse">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-legal-deep-blue" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-accent text-center sm:text-left">
                      Banking Portal
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4 text-xs sm:text-sm text-center sm:text-left">
                    Manage legal documentation, coordinate case workflows, and ensure compliance with banking regulations
                  </p>
                  <Link to="/bank-login">
                    <Button variant="bank" size="lg" className="w-full text-sm sm:text-base">
                      Enter Portal
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Enhanced Features Section with Legal Elements */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-legal-bg relative overflow-hidden">
        {/* Background Law Elements */}
        <div className="absolute inset-0 opacity-5">
          <Scale className="absolute top-10 left-10 h-32 w-32 text-justice-gold animate-spin-slow" />
          <Gavel className="absolute bottom-10 right-10 h-28 w-28 text-court-purple animate-float-slow" />
          <BookOpen className="absolute top-1/2 left-1/4 h-24 w-24 text-legal-deep-blue animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-justice-gold" />
              <span className="text-justice-gold font-semibold text-xs sm:text-sm md:text-base">PROFESSIONAL EXCELLENCE</span>
              <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-justice-gold" />
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-4">
              Why Choose Our 
              <span className="text-foreground"> Legal Platform?</span>
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Built specifically for the legal and banking industry with security, compliance, 
              and professional excellence at its core.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {/* Enterprise Security */}
            <div className="text-center group hover:scale-105 transition-all duration-300 px-4">
              <div className="mx-auto mb-4 sm:mb-6 relative flex justify-center">
                <div className="p-4 sm:p-6 bg-gradient-law-firm rounded-full shadow-elegant group-hover:shadow-glow transition-all">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-justice-gold group-hover:animate-spin-3s" />
                </div>
                <div className="absolute -top-2 -right-2 p-1 bg-justice-gold rounded-full animate-pulse">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-legal-deep-blue" />
                </div>
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-legal-deep-blue">Enterprise Security</h4>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                Bank-grade encryption, multi-factor authentication, and security protocols 
                designed to protect sensitive legal data and client confidentiality.
              </p>
              <div className="mt-3 sm:mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-justice-gold rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-court-purple rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-legal-deep-blue rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Seamless Collaboration */}
            <div className="text-center group hover:scale-105 transition-all duration-300 px-4">
              <div className="mx-auto mb-4 sm:mb-6 relative flex justify-center">
                <div className="p-4 sm:p-6 bg-gradient-prestige rounded-full shadow-elegant group-hover:shadow-glow transition-all">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-legal-deep-blue group-hover:animate-spin-3s" />
                </div>
                <div className="absolute -top-2 -right-2 p-1 bg-prestige-amber rounded-full animate-pulse">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-legal-deep-blue" />
                </div>
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-court-purple">Seamless Collaboration</h4>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                Streamlined communication workflows, real-time document sharing, 
                and integrated case management between advocates and banking professionals.
              </p>
              <div className="mt-3 sm:mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-prestige-amber rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-justice-gold rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-court-purple rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Compliance Ready */}
            <div className="text-center group hover:scale-105 transition-all duration-300 px-4">
              <div className="mx-auto mb-4 sm:mb-6 relative flex justify-center">
                <div className="p-4 sm:p-6 bg-gradient-justice rounded-full shadow-elegant group-hover:shadow-glow transition-all">
                  <Scale className="h-10 w-10 sm:h-12 sm:w-12 text-prestige-amber group-hover:animate-spin-3s" />
                </div>
                <div className="absolute -top-2 -right-2 p-1 bg-law-emerald rounded-full animate-pulse">
                  <Gavel className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-law-emerald">Compliance Ready</h4>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                Built to meet legal and financial industry compliance requirements, 
                with audit trails, regulatory reporting, and industry-standard protocols.
              </p>
              <div className="mt-3 sm:mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-law-emerald rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-legal-deep-blue rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-justice-gold rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Additional Legal Credentials Section */}
          <div className="mt-12 sm:mt-16 md:mt-20 text-center px-4">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 bg-gradient-card rounded-xl sm:rounded-2xl shadow-elegant">
              <div className="flex items-center gap-2 sm:gap-3">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-justice-gold" />
                <span className="text-sm sm:text-base md:text-lg font-semibold text-legal-deep-blue">Bar Certified</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-court-purple" />
                <span className="text-sm sm:text-base md:text-lg font-semibold text-legal-deep-blue">ISO Compliant</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Gavel className="h-6 w-6 sm:h-8 sm:w-8 text-law-emerald" />
                <span className="text-sm sm:text-base md:text-lg font-semibold text-legal-deep-blue">Court Approved</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-prestige-amber" />
                <span className="text-sm sm:text-base md:text-lg font-semibold text-legal-deep-blue">Legal Standards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced About Us Section with Professional Image */}
      <section id="about-us" className="py-12 sm:py-16 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-justice-gold" />
                <span className="text-justice-gold font-semibold uppercase tracking-wider text-xs sm:text-sm">About Our Firm</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                Trusted Legal Expertise for 
                <span className="text-transparent bg-gradient-justice bg-clip-text"> Modern Banking</span>
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                With decades of combined experience in banking law and financial regulations, 
                Babu Advocates provides comprehensive legal solutions that bridge the gap 
                between traditional legal practice and modern digital banking requirements.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-justice-gold" />
                  <span className="text-sm sm:text-base md:text-lg font-medium">25+ Years Legal Experience</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-court-purple" />
                  <span className="text-sm sm:text-base md:text-lg font-medium">Banking Law Specialists</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-law-emerald" />
                  <span className="text-sm sm:text-base md:text-lg font-medium">Industry Recognition</span>
                </div>
              </div>
            </div>
            
            <div className="relative group mt-8 md:mt-0">
              <div className="absolute inset-0 bg-gradient-justice rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-elegant group-hover:shadow-glow transition-all duration-300">
                <img src="https://iyizrpyjtkmpefaqzeth.supabase.co/storage/v1/object/sign/Images/babu.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xZjhhMGM2OC01YTdkLTQ4NmYtOWVlMC02NmI0MTJjZjRlMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvYmFidS5qcGciLCJpYXQiOjE3NTg3OTk5NjUsImV4cCI6MjIzMTgzOTk2NX0.XVseaufwvaIWrCS803wdnchMx4LTxiyflrrHnl7nCS0" alt="Professional law office interior with law books" className="w-full h-[400px] sm:h-[700px] md:h-[800px] object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Preview Section */}
      <section id="contact" className="py-12 sm:py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-justice-gold animate-pulse" />
              <span className="text-justice-gold font-semibold uppercase tracking-wider text-xs sm:text-sm">Get In Touch</span>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-justice-gold animate-pulse" />
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4 px-4">
              Ready to Secure Your Legal Matters?
            </h3>
            <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Contact our experienced legal team for professional consultation and case management services.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-4 sm:p-6 bg-primary-foreground/10 rounded-xl">
              <Phone className="h-10 w-10 sm:h-12 sm:w-12 text-justice-gold mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold text-primary-foreground mb-2">Call Us</h4>
              <p className="text-primary-foreground/80 text-sm sm:text-base">+919842274742</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-primary-foreground/10 rounded-xl">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-justice-gold mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold text-primary-foreground mb-2">Email Us</h4>
              <p className="text-primary-foreground/80 text-sm sm:text-base break-all">legaldoctors@gmail.com</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-primary-foreground/10 rounded-xl sm:col-span-2 md:col-span-1">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-justice-gold mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold text-primary-foreground mb-2">Visit Us</h4>
              <p className="text-primary-foreground/80 text-sm sm:text-base">Plot No 25E, Thiruvalluvar St, behind Arulmalar School, Managiri, Madurai, Tamil Nadu 625020</p>
            </div>
          </div>
        </div>
      </section>

      {/* Small Footer */}
      <footer className="bg-legal-deep-blue py-6 sm:py-8 border-t-2 border-justice-gold/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-justice-gold rounded-lg">
                  <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-legal-deep-blue" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-primary-foreground">Babu Advocates</span>
                  <p className="text-justice-gold text-xs sm:text-sm">Professional Legal Services</p>
                </div>
              </div>
              <p className="text-primary-foreground/80 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                Providing comprehensive legal solutions for banking and financial institutions 
                with expertise, integrity, and professional excellence.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-primary-foreground mb-3 sm:mb-4">Contact</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-justice-gold flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-xs sm:text-sm">+919842274742</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-justice-gold flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-xs sm:text-sm break-all">legaldoctors@gmail.com</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-justice-gold flex-shrink-0 mt-0.5" />
                  <span className="text-primary-foreground/80 text-xs sm:text-sm">Plot No 25E, Thiruvalluvar St, behind Arulmalar School, Managiri, Madurai, Tamil Nadu 625020</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-primary-foreground/20 pt-4 sm:pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 text-center md:text-left">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-justice-gold animate-pulse flex-shrink-0" />
                <span className="text-primary-foreground/80 text-xs sm:text-sm">
                  Secure Case Management Platform • Professional Legal Services
                </span>
              </div>
              <div className="text-primary-foreground/60 text-xs sm:text-sm text-center md:text-right">
                © 2025 Babu Advocates • Powered by Techverse Infotech Private Limited
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;