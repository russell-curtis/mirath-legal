import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Building2, User, FileText, Shield, CheckCircle, Users, Globe, Scale } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-20 px-6">
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Main Hero */}
        <div className="relative text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <Scale className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Mirath Legal</h1>
                <p className="text-sm text-gray-600">DIFC Estate Planning Platform</p>
              </div>
            </div>
          </div>
          
          <h2 className="mx-auto max-w-4xl text-balance text-5xl font-medium mb-6">
            DIFC-Compliant Estate Planning
            <br />
            <span className="text-blue-600">Made Simple</span>
          </h2>
          
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-balance text-xl">
            The UAE's leading digital platform for creating, managing, and registering 
            DIFC-compliant wills with AI-powered legal assistance.
          </p>

          <div className="flex items-center justify-center gap-2 mb-8">
            <Badge variant="outline" className="border-green-300 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              DIFC Registered
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              <Shield className="h-3 w-3 mr-1" />
              UAE Legal Compliant
            </Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              <FileText className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Law Firms */}
          <Card className="relative p-6 border-2 hover:border-blue-300 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">For Law Firms</CardTitle>
              <CardDescription className="text-base">
                Professional estate planning platform for UAE law firms
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Multi-client matter management</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>AI-powered will generation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>DIFC registration workflow</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>White-label client portal</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Team collaboration tools</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild className="w-full" size="lg">
                  <Link href="/register/firm">
                    <Building2 className="h-4 w-4 mr-2" />
                    Register Your Firm
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Verification required • 30-day trial included
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Individual Clients */}
          <Card className="relative p-6 border-2 hover:border-green-300 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mx-auto mb-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">For Individuals</CardTitle>
              <CardDescription className="text-base">
                Create your personal DIFC-compliant will directly
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Personal will creation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>AI-guided questionnaire</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>DIFC compliance checking</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Digital document storage</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Legal review services</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/signup/client">
                    <User className="h-4 w-4 mr-2" />
                    Create Your Will
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Start for free • Legal review available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">Trusted by leading UAE law firms and individuals</p>
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">DIFC Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">UAE Legal Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Multi-Language Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
