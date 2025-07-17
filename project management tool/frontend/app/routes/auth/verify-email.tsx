import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, CheckCircle, Loader, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyEmailMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);
  const {mutate, isPending:isVerifying} = useVerifyEmailMutation();
   useEffect(() => { 
    
    if (token) {
      
      mutate(token, {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error :any) => {
          const errorMessage = 
            error.response?.data?.message || 'An error occurred while verifying your email.';
          setIsSuccess(false);
          console.error(error)

          toast.error(errorMessage)
        },
      });
    }
  }, [searchParams]);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold'>Verify Email</h1>
      <p className='text-sm text-gray-500'>Verifying your email ...</p>
    
    <Card className='w-full max-w-md mx-auto mt-8 p-6 '>
      {/* <CardHeader className='flex flex-col items-center justify-center space-y-4'>
        <h2 className='text-lg font-semibold'>
          {isSuccess ? 'Email Verified Successfully!' : 'Email Verification Failed'}
        </h2>
        <Link to="/sign-in" className='flex items-center gap-2'>
        <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </CardHeader> */}

      <CardContent>
        <div className='flex flex-col items-center justify-center space-y-4 '>
          {isVerifying ? 
          <> 
            <Loader className='w-10 h-10 text-gray-500 animate-spin'/>
            <h3 className='text-lg font-semibold'>Verifying Email</h3>
            <p className='text-sm tetx-gray-500'>Please wait while we verify your email</p>
          </> : isSuccess ? (
            <>
            <CheckCircle className='w-16 h-16 text-green-500' />
            <h3 className='text-lg font-semibold'>Email Verified</h3>
            <p className='text-sm text-gray-500'>Your email has been verified successfully</p>
            <Link to="/sign-in" className='text-sm text-blue-500 mt-6'>
            <Button variant="outline">Back to sign in</Button>
            </Link>
            </>  
          ) : (
            <>
            <XCircle className='w-10 h-10 text-red-500'/>
            <h3 className='text-lg font-semibold'>Verification Failed</h3>
            <p className='text-sm text-gray-500'>The verification link is invalid or has expired.</p>
            <p className='text-sm text-gray-500'>Please try again or contact support.</p>
            <Link to="/sign-in" className='text-sm text-blue-500 mt-6'>
            <Button variant="outline">Back to sign in</Button>
            </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export default VerifyEmail