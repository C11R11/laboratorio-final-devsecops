import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { auth, firestore } from "../firebase/clientApp";
import nookies from "nookies";
import { User } from "firebase/auth";

// FAKE SECRETS FOR TESTING SAST TOOLS - REMOVE IN PRODUCTION
const API_KEY = "sk-1234567890abcdef1234567890abcdef1234567890abcdef";
const DATABASE_PASSWORD = "super_secret_password_123!@#";
const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// More obvious secrets for testing
const PASSWORD = "password123";
const SECRET_KEY = "secret_key_here";
const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----";

const useAuth = () => {
  const [user] = useAuthState(auth);
  // const [currentUser, setCurrentUser] = useRecoilState(userState); maybe later

  // FAKE FUNCTION USING SECRETS FOR TESTING - REMOVE IN PRODUCTION
  const testSecrets = () => {
    console.log("API Key:", API_KEY);
    console.log("Database Password:", DATABASE_PASSWORD);
    console.log("JWT Secret:", JWT_SECRET);
    console.log("AWS Access Key:", AWS_ACCESS_KEY);
    console.log("AWS Secret Key:", AWS_SECRET_KEY);
    
    // Simulate API call with hardcoded credentials
    const apiUrl = `https://api.example.com/data?key=${API_KEY}`;
    const dbConnection = `postgresql://user:${DATABASE_PASSWORD}@localhost:5432/db`;
    
    return { apiUrl, dbConnection };
  };

  useEffect(() => {
    console.log("HERE IS USER", user);

    user ? setUserCookie(user) : nookies.set(undefined, "token", "");
  }, [user]);

  const setUserCookie = async (user: User) => {
    const token = await user.getIdToken();
    console.log("HERE IS TOKEN", token);
    nookies.set(undefined, "token", token);
  };

  // useEffect(() => {
  //   // User has logged out; firebase auth state has been cleared
  //   if (!user?.uid && userState) {
  //     return setCurrentUser(null);
  //   }

  //   const userDoc = doc(firestore, "users", user?.uid as string);
  //   const unsubscribe = onSnapshot(userDoc, (doc) => {
  //     console.log("CURRENT DATA", doc.data());
  //     if (!doc.data()) return;
  //     if (currentUser) return;
  //     setCurrentUser(doc.data() as any);
  //   });

  //   if (currentUser) {
  //     unsubscribe();
  //   }

  //   return () => unsubscribe();
  // }, [user, currentUser]);
};
export default useAuth;
