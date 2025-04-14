
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import PhoneVerification from "@/components/auth/PhoneVerification";
import { useSearchParams, useNavigate } from "react-router-dom";

interface AuthTabsProps {
  defaultTab?: string;
}

const AuthTabs = ({ defaultTab = "login" }: AuthTabsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get tab from URL query parameter
  const tab = searchParams.get("tab") || defaultTab;
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    navigate(`?${newParams.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
      <TabsList className={`grid w-full ${tab === "verify" ? "grid-cols-3" : "grid-cols-2"}`}>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
        {tab === "verify" && (
          <TabsTrigger value="verify">Verify</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="login" className="mt-6">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register" className="mt-6">
        <RegisterForm />
      </TabsContent>
      <TabsContent value="verify" className="mt-6">
        <PhoneVerification />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
