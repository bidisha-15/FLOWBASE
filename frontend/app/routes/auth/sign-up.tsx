import { useForm } from 'react-hook-form'
import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '@/lib/schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router';
import { use } from 'react';
import { useSignUpMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';


export type SignupFormData = z.infer<typeof signUpSchema>;
const SignUp = () => {
  const navigate = useNavigate();
  const form=useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    },
  })

  const {mutate,isPending} = useSignUpMutation()


const handleOnSubmit = (values: SignupFormData) => {
  mutate(values, {
    onSuccess: () => {
      toast.success("Email Verification required. Please check your inbox.", {
        description: "A verification link has been sent to your email address. Please click the link to verify your account.",
      });

      form.reset();
      navigate("/sign-in");
    },
    onError: (error:any) => {
      const errorMessage = 
      error.response?.data?.message || "An error occurred";
      console.log(error);
      toast.error(errorMessage);
      // Show error message to the user
    }
  })
}

  return (
    <div className='flex flex-col items-center 
    justify-center min-h-screen bg-muted/40 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='text-center space-y-2'>
          <CardTitle className='text-2xl font-bold text-center'>
            Create an account
          </CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Please fill in the details to create your account
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
              name="name"
              render={({ field }) => (
                <FormItem>
                 <FormLabel>Full Name</FormLabel> 
                 <FormControl>
                  <Input type="text" placeholder="Robert Hall" {...field}/>
                 </FormControl>
                 <FormMessage />
                </FormItem>
              )} />


              <FormField control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                 <FormLabel>Password</FormLabel> 
                 <FormControl>
                  <Input type="password" placeholder="******" {...field}/>
                 </FormControl>
                 <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                 <FormLabel>Confirm Password</FormLabel> 
                 <FormControl>
                  <Input type="password" placeholder="******" {...field}/>
                 </FormControl>
                 <FormMessage />
                </FormItem>
              )} />


              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating Account..." : "Sign Up"}
                </Button>
            </form>
          </Form>

          <CardFooter className='flex flex-col items-center mt-4'>
            <p className='text-sm text-muted-foreground text-center mt-4'>
              Already have an account <Link to="/sign-in" className='text-primary hover:underline'>Sign In</Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp