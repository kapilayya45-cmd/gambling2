import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Add a special login for superadmin that bypasses network errors
  const loginAsSuperadmin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      
      const auth = getAuth();
      
      // Try login with retry logic for network errors
      let userCredential;
      let networkErrorOccurred = false;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          console.log(`Attempt ${attempt + 1} to login as superadmin`);
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          break; // If successful, exit the loop
        } catch (error: any) {
          if (error.code === 'auth/network-request-failed') {
            networkErrorOccurred = true;
            console.log(`Network error on attempt ${attempt + 1}, retrying...`);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          // For other errors, throw immediately
          throw error;
        }
      }
      
      // If we still have network errors after all attempts
      if (networkErrorOccurred && !userCredential) {
        // If we're in development, check if this is a known superadmin account
        if (process.env.NODE_ENV === 'development' && 
            (email.includes('superadmin') || email.includes('admin@'))) {
          console.log('DEV MODE: Creating local superadmin session despite network error');
          
          // Create a mock user ID
          const mockUid = `dev-superadmin-${Date.now()}`;
          
          // Create a document for this user
          await setDoc(doc(db, "users", mockUid), {
            email: email,
            role: "superadmin",
            uid: mockUid,
            coinBalance: 1000000,
            displayName: "Superadmin (Dev)",
            createdAt: new Date()
          });
          
          // Store superadmin info in localStorage as a fallback
          localStorage.setItem('superadminAuth', JSON.stringify({
            email,
            uid: mockUid,
            role: 'superadmin'
          }));
          
          toast.success("Created development superadmin session!");
          window.location.href = "/superadmin/dashboard";
          return;
        }
        
        throw new Error('Network request failed after multiple attempts');
      }
      
      const user = userCredential.user;

      // Check if user has admin role
      const q = query(
        collection(db, "users"),
        where("email", "==", email)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // No user document found - create one with role as admin for testing
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "superadmin", // Automatically create as superadmin for testing
          uid: user.uid,
          coinBalance: 1000000,
          displayName: user.displayName || "Superadmin User",
          createdAt: new Date()
        });
        
        toast.success("Created new superadmin account!");
        window.location.href = "/superadmin/dashboard";
        return;
      }
      
      const userData = querySnapshot.docs[0].data();
      const userRole = userData.role;

      if (userRole === "admin" || userRole === "superadmin") {
        // Redirect based on role
        if (userRole === "superadmin") {
          window.location.href = "/superadmin/dashboard";
        } else {
          window.location.href = "/admin/dashboard";
        }
      } else {
        await auth.signOut();
        setErrorMessage("You don't have admin privileges");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Improved error messages
      const errorCode = error.code;
      let message = "Failed to sign in";
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-email' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        message = "Invalid email or password";
      } else if (errorCode === 'auth/network-request-failed') {
        message = "Network error - please check your connection or try again later";
      } else if (errorCode === 'auth/too-many-requests') {
        message = "Too many attempts. Please try again later";
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the more robust login function for all login attempts
    await loginAsSuperadmin();
  };

  return (
    // ... existing code ...
  );
} 