import React from 'react'
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Flowbase" },
    { name: "description", content: "Welcome to Flowbase!" },
  ];
}

const Homepage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        <Link to="/sign-in"><Button>Login</Button></Link>
        <Link to="/sign-up"><Button variant="outline" className='mt-4'>Sign Up</Button></Link>
        
    </div>
  )
}

export default Homepage