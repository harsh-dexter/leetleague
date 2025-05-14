
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addFriendToLocalStorage, getFriendsFromLocalStorage } from "@/lib/utils";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded: () => void; // Callback to trigger refetch
}

const AddFriendModal = ({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateAndAddFriend = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Please enter a LeetCode username.");
      return;
    }

    const currentFriends = getFriendsFromLocalStorage();
    if (currentFriends.includes(trimmedUsername)) {
      toast.info(`${trimmedUsername} is already in your friends list.`);
      setUsername("");
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // Validate username by trying to fetch their profile
      const res = await fetch("/.netlify/functions/leetcode", {
        method: "POST",
        body: JSON.stringify({
          query: `
            query userPublicProfile($username: String!) {
              matchedUser(username: $username) {
                username
              }
            }
          `,
          variables: { username: trimmedUsername },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `Failed to verify user: ${res.statusText}`);
      }

      const result = await res.json();

      if (result.errors || !result.data?.matchedUser) {
        console.error("GraphQL error or user not found:", result.errors);
        toast.error(`User "${trimmedUsername}" not found on LeetCode or an error occurred.`);
        setIsLoading(false);
        return;
      }
      
      // User exists, add to localStorage
      addFriendToLocalStorage(trimmedUsername);
      toast.success(`Added ${trimmedUsername} as a friend!`);
      onFriendAdded(); // Trigger refetch in parent
      setUsername("");
      onClose();

    } catch (error: any) {
      console.error("Error adding friend:", error);
      toast.error(error.message || "Could not add friend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-leetcode-purple" />
            Add Friend
          </DialogTitle>
          <DialogDescription>
            Enter the LeetCode username of a friend you want to track.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="leetcode_user"
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={validateAndAddFriend} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Add Friend
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
