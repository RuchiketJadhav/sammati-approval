
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LockKeyhole, User, Mail, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Find user by email
      const user = users.find(u => u.email === values.email);
      
      if (!user) {
        toast.error("Invalid email or password");
        return;
      }
      
      // Check if password matches user name (case insensitive)
      // This handles cases like "Registrar Office" vs "RegistrarOffice"
      const passwordMatches = 
        user.name.toLowerCase() === values.password.toLowerCase() ||
        user.name.toLowerCase().replace(/\s+/g, '') === values.password.toLowerCase().replace(/\s+/g, '');
      
      if (!passwordMatches) {
        toast.error("Invalid email or password");
        return;
      }
      
      // Login successful
      login(user.id);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/");
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sammati Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the proposal system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            {...field} 
                            placeholder="email@chanakya.edu.in" 
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="pl-10 pr-10"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="mt-2 text-center text-sm text-muted-foreground">
              <span>Use your university email and your name as password for this demo</span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo Accounts</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <div className="rounded border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">User Name</th>
                      <th className="p-2 text-left font-medium">Email</th>
                      <th className="p-2 text-left font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Registrar</td>
                      <td className="p-2 text-blue-600">registrar@chanakyauniversity.edu.in</td>
                      <td className="p-2">Registrar</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-2">Registrar Office</td>
                      <td className="p-2 text-blue-600">registraroffice@chanakyauniversity.edu.in</td>
                      <td className="p-2">Admin</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ruchiket</td>
                      <td className="p-2 text-blue-600">ruchiket@chanakyauniversity.edu.in</td>
                      <td className="p-2">User</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-2">Shiva</td>
                      <td className="p-2 text-blue-600">shiva@chanakyauniversity.edu.in</td>
                      <td className="p-2">User</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Nandani</td>
                      <td className="p-2 text-blue-600">nandani@chanakyauniversity.edu.in</td>
                      <td className="p-2">User</td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-2">Finance Office</td>
                      <td className="p-2 text-blue-600">financeoffice@chanakyauniversity.edu.in</td>
                      <td className="p-2">Approver</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Admin Office</td>
                      <td className="p-2 text-blue-600">adminoffice@chanakyauniversity.edu.in</td>
                      <td className="p-2">Approver</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
