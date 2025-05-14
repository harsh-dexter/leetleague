
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Friend } from "@/lib/types";
import { useState } from "react";
import AddFriendModal from "./AddFriendModal";
import UserCard from "./UserCard";
import { Plus, Users, Loader2, XCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendsFromLocalStorage, removeFriendFromLocalStorage } from "@/lib/utils";
import { toast } from "sonner";


interface FetchedFriendInfo extends Friend {}

const fetchFriendsInfo = async (): Promise<FetchedFriendInfo[]> => {
  const friendsUsernames = getFriendsFromLocalStorage();
  if (friendsUsernames.length === 0) {
    return [];
  }

  const data: Array<Partial<FetchedFriendInfo> & { error?: string }> = await Promise.all(
    friendsUsernames.map(async (username): Promise<Partial<FetchedFriendInfo> & { error?: string }> => {
      try {
        const res = await fetch("/.netlify/functions/leetcode", {
          method: "POST",
          body: JSON.stringify({
            query: `
              query userPublicProfile($username: String!) {
                matchedUser(username: $username) {
                  username
                  profile {
                    realName
                    userAvatar
                    ranking
                  }
                  submitStatsGlobal {
                    acSubmissionNum {
                      count
                      difficulty
                    }
                  }
                }
              }
            `,
            variables: { username },
          }),
        });
        if (!res.ok) {
          console.error(`Failed to fetch friend info for ${username}: ${res.status}`);
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Failed for ${username}: ${errorData?.error || res.statusText}`);
        }
        const result = await res.json();
        if (result.errors || !result.data?.matchedUser) {
          console.error(`GraphQL error or user not found for ${username}:`, result.errors, result.data);
           if (result.data?.matchedUser === null) {
            return { id: username, username, error: "User not found" };
          }
          return { id: username, username, error: "User not found or API error" };
        }
        
        const matchedUser = result.data.matchedUser;
        const totalSolved = matchedUser.submitStatsGlobal?.acSubmissionNum?.find((s: any) => s.difficulty === "All")?.count ||
                            matchedUser.submitStatsGlobal?.acSubmissionNum?.[0]?.count || // Fallback if "All" is not present but array is
                            0;

        return {
          id: username, 
          username: matchedUser.username,
          realName: matchedUser.profile.realName,
          avatar: matchedUser.profile.userAvatar,
          ranking: matchedUser.profile.ranking,
          totalSolved: totalSolved,
          // error property is implicitly undefined here
        };
      } catch (error) {
        console.error(`Error fetching friend info for ${username}:`, error);
        return { id: username, username, error: (error as Error).message };
      }
    })
  );
  return data.filter(friend => friend && !friend.error).map(friend => {
    // Remove error property before casting to FetchedFriendInfo[]
    const { error, ...rest } = friend;
    return rest;
  }) as FetchedFriendInfo[];
};


const FriendsList = () => {
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: friends, isLoading, error, refetch } = useQuery<FetchedFriendInfo[], Error>({
    queryKey: ["friendsInfo"],
    queryFn: fetchFriendsInfo,
  });

  const openAddFriendModal = () => setIsAddFriendModalOpen(true);
  const closeAddFriendModal = () => setIsAddFriendModalOpen(false);

  const handleFriendAdded = () => {
    refetch(); 
    queryClient.invalidateQueries({ queryKey: ["leaderboardSolvedToday"] });
    queryClient.invalidateQueries({ queryKey: ["recentSubmissions"] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] }); 
  };

  const handleRemoveFriend = (username: string) => {
    removeFriendFromLocalStorage(username);
    toast.info(`Removed ${username} from friends.`);
    refetch(); 
    queryClient.invalidateQueries({ queryKey: ["leaderboardSolvedToday"] });
    queryClient.invalidateQueries({ queryKey: ["recentSubmissions"] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] }); 
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-leetcode-purple" />
            Friends
          </CardTitle>
          <Button size="sm" onClick={openAddFriendModal} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Friend
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-leetcode-purple" />
          <p className="ml-2">Loading friends...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
         <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-leetcode-purple" />
            Friends
          </CardTitle>
           <Button size="sm" onClick={openAddFriendModal} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Friend
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading friends: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-2 p-2 bg-blue-500 text-white rounded">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-leetcode-purple" />
            Friends
          </CardTitle>
          <Button size="sm" onClick={openAddFriendModal} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Friend
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(!friends || friends.length === 0) ? (
              <div className="text-muted-foreground text-center py-6">
                No friends added yet. Add some friends to see their progress!
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-2">
                  <UserCard user={friend} className="flex-grow" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFriend(friend.username)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${friend.username}`}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={closeAddFriendModal}
        onFriendAdded={handleFriendAdded}
      />
    </>
  );
};

export default FriendsList;
