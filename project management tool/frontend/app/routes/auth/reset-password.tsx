import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useResetPasswordMutation } from '@/hooks/use-auth';
import { resetPasswordSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';


type resetPasswordFormData = z.infer<typeof resetPasswordSchema>;
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const form = useForm<resetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: resetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    resetPassword(
      { 
        token, 
        newPassword: data.newPassword, 
        confirmPassword: data.confirmPassword 
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'An error occurred while resetting your password.';
          console.error('Reset password error:', error);
          toast.error(errorMessage);
        },
      }
    );
  };


  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <h1 className='text-2xl font-bold text-gray-800'>Reset Password</h1>
          <p className='text-muted-foreground'>Please enter your new password.</p>
        </div>        <Card className='bg-white shadow-md rounded-lg'>
          <CardHeader className='bg-white p-6'>
            <Link to="/sign-in" className='flex items-center space-x-2 text-blue-600 hover:text-blue-800'>
            <ArrowLeft className='w-4 h-4'/>
            <span>Back to sign in</span>
            </Link>
          </CardHeader>

          <CardContent className='p-6'>
            {isSuccess ? (
              <div className='flex flex-col items-center justify-center space-y-4'>
                <CheckCircle className='w-10 h-10 text-green-500'/>
                <h2 className='text-2xl font-bold'>Password Reset Successfully</h2>
                <p className='text-muted-foreground text-center'>Your password has been reset successfully. You can now sign in with your new password.</p>
                <Link to="/sign-in" className='text-blue-600 hover:text-blue-800'>
                  Go to Sign In
                </Link>
              </div>
            ) : !token ? (
              <div className='flex flex-col items-center justify-center space-y-4'>
                <p className='text-red-500'>Invalid or missing reset token.</p>
                <Link to="/forgot-password" className='text-blue-600 hover:text-blue-800'>
                  Request new reset link
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField 
                    name='newPassword' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder='Enter new password'/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />

                  <FormField 
                    name='confirmPassword' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder='Confirm new password'/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />

                  <Button type="submit" className='w-full mt-4' disabled={isPending}>
                    {isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword