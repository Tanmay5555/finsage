"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; // Your Firebase auth instance
import { updateProfile, signOut, User, onAuthStateChanged } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Mail, Pencil, Save, XCircle, Brain, Sparkles } from "lucide-react";

// Assuming you have a DashboardLayout component
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || ""); // Initialize display name from Firebase
      } else {
        // No user is logged in, redirect to login page
        router.push("/login");
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [router]);

  // Handle display name update
  const handleUpdateDisplayName = async () => {
    if (!currentUser) {
      toast.error("No user logged in.");
      return;
    }
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName === "") {
      toast.error("Display name cannot be empty.");
      return;
    }
    if (trimmedDisplayName === currentUser.displayName) {
      setIsEditingName(false); // No change, just exit edit mode
      return;
    }

    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: trimmedDisplayName });
      toast.success("Display name updated successfully!");
      setIsEditingName(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error(`Failed to update display name: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      router.push("/login"); // Redirect to login page after logout
    } catch (err: any) {
      console.error("Error logging out:", err);
      toast.error(`Failed to log out: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    // Optionally show a loading spinner or a message while auth state is being determined
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center text-gray-400">
          Loading user data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 text-foreground p-4 md:p-6"> 
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-md text-muted-foreground">
            Manage your profile and learn about Finsage's AI capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information Card */}
          <Card className="bg-[#161b33] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon size={20} /> Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Address (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground text-white">
                  <Mail size={16} /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser.email || ""}
                  readOnly
                  className="bg-[#1f2547] text-white border-none cursor-not-allowed"
                />
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center gap-2 text-muted-foreground  text-white">
                  <UserIcon size={16} /> Display Name
                </Label>
                <div className="flex items-center gap-2 ">
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    readOnly={!isEditingName}
                    className={`bg-[#1f2547] text-white border-none ${!isEditingName ? 'cursor-text' : ''}`}
                  />
                  {isEditingName ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleUpdateDisplayName}
                        disabled={loading}
                        className="text-green-400 hover:text-green-500 hover:bg-transparent"
                        title="Save Name"
                      >
                        <Save size={20} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditingName(false);
                          setDisplayName(currentUser.displayName || ""); // Revert changes
                        }}
                        disabled={loading}
                        className="text-red-400 hover:text-red-500 hover:bg-transparent"
                        title="Cancel Edit"
                      >
                        <XCircle size={20} />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingName(true)}
                      disabled={loading}
                      className="text-blue-400 hover:text-blue-500 hover:bg-transparent"
                      title="Edit Name"
                    >
                      <Pencil size={20} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Logout Button - Shorter and Centered */}
              <div className="pt-4 border-t border-white/10 flex justify-center">
                <Button
                  onClick={handleLogout}
                  className="w-fit px-6 py-2 bg-red-600 hover:bg-red-700 flex items-center gap-2 rounded-md"
                  disabled={loading}
                >
                  <LogOut size={18} /> {loading ? "Logging Out..." : "Logout"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About Finsage AI Financial Assistant Card */}
          <Card className="bg-[#161b33] text-white flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} className="text-purple-400" /> About Finsage AI Financial Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow text-white">
              <p className="text-sm text-muted-foreground text-white">
                Finsage is powered by advanced AI to give you smart, personalized financial insights. Our AI assistant analyzes your income, expenses, and savings patterns to provide actionable advice.
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2 text-white">
                  <Sparkles size={16} className="text-yellow-400 flex-shrink-0 mt-[2px]" />
                  <span >
                    <strong className="text-purple-400">Intelligent Insights:</strong> Get a deeper understanding of your financial health with AI-driven analysis of your monthly spending and income trends.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <Sparkles size={16} className="text-yellow-400 flex-shrink-0 mt-[2px]" />
                  <span>
                  <strong className="text-purple-400">Personalized Tips:</strong> Receive tailored recommendations to optimize your budget, identify areas for savings, and achieve your financial goals faster.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <Sparkles size={16} className="text-yellow-400 flex-shrink-0 mt-[2px]" />
                  <span>
                  <strong className="text-purple-400">Anomaly Detection:</strong> Our AI can help spot unusual spending patterns or potential issues, keeping you informed and in control.
                  </span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground text-white">
                We're continuously enhancing Finsage's AI capabilities to provide you with the most relevant and helpful financial guidance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
