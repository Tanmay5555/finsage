"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  updateProfile,
  signOut,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  LogOut,
  User as UserIcon,
  Mail,
  Pencil,
  Save,
  XCircle,
  Brain,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || "");
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateDisplayName = async () => {
    if (!currentUser) {
      toast.error("No user logged in.");
      return;
    }
    const trimmed = displayName.trim();
    if (trimmed === "") {
      toast.error("Display name cannot be empty.");
      return;
    }
    if (trimmed === currentUser.displayName) {
      setIsEditingName(false);
      return;
    }

    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: trimmed });
      toast.success("Display name updated successfully!");
      setIsEditingName(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(`Failed to update display name: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(`Failed to log out: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
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
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-md text-muted-foreground">
            Manage your profile and learn about Finsage&apos;s AI capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="bg-[#161b33] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon size={20} /> Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-muted-foreground text-white"
                >
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

              <div className="space-y-2">
                <Label
                  htmlFor="displayName"
                  className="flex items-center gap-2 text-muted-foreground text-white"
                >
                  <UserIcon size={16} /> Display Name
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    readOnly={!isEditingName}
                    className={`bg-[#1f2547] text-white border-none ${!isEditingName ? "cursor-text" : ""}`}
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
                          setDisplayName(currentUser.displayName || "");
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

              <div className="pt-4 border-t border-white/10 flex justify-center">
                <Button
                  onClick={handleLogout}
                  className="w-fit px-6 py-2 bg-red-600 hover:bg-red-700 flex items-center gap-2 rounded-md"
                  disabled={loading}
                >
                  <LogOut size={18} />
                  {loading ? "Logging Out..." : "Logout"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Card */}
          <Card className="bg-[#161b33] text-white flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} className="text-purple-400" /> About Finsage AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-sm text-muted-foreground text-white">
                Finsage is powered by advanced AI to give you smart, personalized financial insights.
              </p>
              <ul className="list-disc list-inside text-sm space-y-2">
                <li className="flex gap-2 text-white">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>
                    <strong className="text-purple-400">Intelligent Insights:</strong> Analyze monthly trends in your finances.
                  </span>
                </li>
                <li className="flex gap-2 text-white">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>
                    <strong className="text-purple-400">Personalized Tips:</strong> Optimize your budget and reach goals faster.
                  </span>
                </li>
                <li className="flex gap-2 text-white">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>
                    <strong className="text-purple-400">Anomaly Detection:</strong> Spot suspicious or abnormal spending patterns.
                  </span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground text-white">
                We&apos;re continuously enhancing Finsage&apos;s capabilities to better serve you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
