import {createContext, useContext, useEffect, useState} from 'react';
import type {User} from '@/types';
import React from 'react';
import { queryClient } from './react-query-provider';
import { useLocation, useNavigate } from 'react-router';
import { publicRoutes } from '@/lib';
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    login: (data:any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const currentPath = useLocation().pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);
    //check if user authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const userStr = localStorage.getItem("user");
            
            if (token && userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Error parsing user data:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
                if (!isPublicRoute) {
                    navigate("/sign-in");
                }
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);


    useEffect(() => {
        const handleLogout = () => {
            logout();
            navigate("/sign-in");
        };
        window.addEventListener("force-logout", handleLogout);
        return () => 
            window.removeEventListener("force-logout", handleLogout);
       
    }, []);



    const login = async (data:any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
    }

    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        queryClient.clear();
    }

    const values={
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    }
   
    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () : AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}