"use client";

import LogOutModal from "@/components/LogOutModal";
import UseModal from "@/components/Modal";
import SettingsDropdown from "@/components/SettingsDropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { deleteAccount, updateUserProfile } from "@/lib/features/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AccountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const {toast} = useToast()

  // Local state to manage form editing
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [editing, setEditing] = useState(false);

  // Update local state when the user object changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  // Handler for form submission to update profile
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Dispatch the update action and wait for the result
      await dispatch(
        updateUserProfile({ fullName, email, id: user?._id||"" })
      ).unwrap();
      toast({
        variant:"success",
        title:"Update info",
        description:"Profile updated successfully!"
      });
      setEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        variant:"destructive",
        title:"Update info",
        description:"something went wrong, Failed to update profile.",
      });
    }
  };

  const handleDelete = () => {
    dispatch(deleteAccount({ email }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <SettingsDropdown />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!editing}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editing}
                placeholder="Enter your email"
              />
            </div>
            {editing && (
              <div className="flex space-x-4">
                <Button type="submit">Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Show an "Edit Profile" button when not in editing mode */}
      {!editing && (
        <div className="w-full flex justify-between items-center mt-5">
          <div className="flex items-center gap-3">
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
         {
          user && user.role === 'user' &&  <UseModal
          trigger={<Button variant={"destructive"}>Delete Account</Button>}
          contentHeader={{
            title: "Delete Account",
            description: "Are you sure you want to delete your account?",
          }}
          contentFooter={{
            children: (
              <div className="w-full flex flex-col gap-3">
                <DialogClose asChild>
                  <Button variant={"default"}>Cancel</Button>
                </DialogClose>
                <Button
                  variant={"destructive"}
                  onClick={() => handleDelete()}
                >
                  Yes, Delete
                </Button>
              </div>
            ),
          }}
        ></UseModal>
         }
         
        </div>

        
        <LogOutModal trigger={
          <Button variant={"secondary"}><LogOut/> logout</Button>
        }/>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
