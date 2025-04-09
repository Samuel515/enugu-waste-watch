
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

const AuthTabs = () => {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="mt-6">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register" className="mt-6">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
