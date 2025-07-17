import { useForm } from 'react-hook-form'
import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/lib/schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Navigate, useNavigate } from 'react-router';
import { useLoginMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader, Loader2 } from 'lucide-react';
import { useAuth } from '@/provider/auth-context';

type SigninFormData = z.infer<typeof signInSchema>;
const SignIn = () => {
  const navigate = useNavigate();
  const {login} = useAuth()
  const form=useForm<SigninFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const {mutate, isPending} = useLoginMutation();
const handleOnSubmit = (values: SigninFormData) => {
  mutate(values, {
    onSuccess: (data) => {
      login(data); // Assuming login function sets user state and token
      console.log('Login successful:', data);
      toast.success('Login successful');
      navigate('/dashboard'); // Redirect to dashboard or home page
    },
    onError: (error:any) => {
      // Handle error, e.g., show a notification
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('Login error:', errorMessage);
      toast.error(errorMessage);
    },
  });
}

  return (
    <div className='flex flex-col items-center 
    justify-center min-h-screen bg-muted/40 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='text-center space-y-2'>
          <CardTitle className='text-2xl font-bold text-center'>
            Welcome Back
          </CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Please sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className='space-y-4'>
              <FormField control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                 <FormLabel>Email Address</FormLabel> 
                 <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field}/>
                 </FormControl>
                 <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel> 
                    <Link to="/forgot-password" 
                    className='text-sm text-black foreground'>
                      Forgot Password</Link>
                  </div>
                 
                 <FormControl>
                  <Input type="password" placeholder="******" {...field}/>
                 </FormControl>
                 <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending? <Loader2 className='h-4 w-4 mr-2' /> : 'Sign In'}
              </Button>
            </form>
          </Form>

          <CardFooter className='flex flex-col items-center mt-4'>
            <p className='text-sm text-muted-foreground text-center mt-4'>
              Don&apos;t have an account? <Link to="/sign-up" className='text-primary hover:underline'>Sign Up</Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn