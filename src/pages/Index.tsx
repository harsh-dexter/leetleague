
import ActivityFeed from "@/components/ActivityFeed";
import FriendsList from "@/components/FriendsList";
import LeaderBoard from "@/components/LeaderBoard";
import QuestionViewer from "@/components/QuestionViewer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeAwareLogo } from "@/components/ThemeAwareLogo"; // Import the new logo component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Star, TrendingUp, Users, Loader2 } from "lucide-react"; 
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendsFromLocalStorage } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LeaderboardStatEntry { // Renamed for clarity specific to this file's usage
  username: string;
  solvedToday: number;
  id: string;
}

const fetchLeaderBoardDataForStats = async (): Promise<LeaderboardStatEntry[]> => {
  const friends = getFriendsFromLocalStorage();
  if (friends.length === 0) {
    return [];
  }
  const today = new Date();
  const todayUtcMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const todayTs = Math.floor(todayUtcMidnight.getTime() / 1000);
  const currentYear = today.getUTCFullYear();

  const data = await Promise.all(
    friends.map(async (username) => {
      try {
        const res = await fetch("/.netlify/functions/leetcode", {
          method: "POST",
          body: JSON.stringify({
            query: `
              query userProfileCalendar($username: String!, $year: Int) {
                matchedUser(username: $username) {
                  userCalendar(year: $year) {
                    submissionCalendar
                  }
                }
              }
            `,
            variables: { username, year: currentYear },
            operationName: "userProfileCalendar"
          }),
        });
        if (!res.ok) {
          console.error(`Stats: Failed to fetch data for ${username}: ${res.status}`);
          return { username, solvedToday: 0, id: username }; // Return default on error
        }
        const result = await res.json();
        if (result.errors || !result.data?.matchedUser?.userCalendar?.submissionCalendar) {
          console.error(`Stats: GraphQL errors for ${username} or data missing:`, result.errors, result.data);
          return { username, solvedToday: 0, id: username }; // Return default on error
        }
        const calendarStr = result.data.matchedUser.userCalendar.submissionCalendar;
        const calendar = JSON.parse(calendarStr || "{}");
        return {
          username,
          solvedToday: calendar[todayTs.toString()] || 0,
          id: username,
        };
      } catch (error) {
        console.error(`Stats: Error fetching leaderboard for ${username}:`, error);
        return { username, solvedToday: 0, id: username }; // Return default on error
      }
    })
  );
  return data;
};


const Index = () => {
  const [totalFriends, setTotalFriends] = useState(getFriendsFromLocalStorage().length);
  const queryClient = useQueryClient();

  const { data: leaderboardData, isLoading: isLoadingLeaderboard, error: errorLeaderboard } = useQuery<LeaderboardStatEntry[], Error>({
    queryKey: ["leaderboard"], 
    queryFn: fetchLeaderBoardDataForStats,
  });

  const problemsSolvedToday = leaderboardData?.reduce((sum, friend) => sum + friend.solvedToday, 0) ?? 0;

  useEffect(() => {
    const updateTotalFriendsCount = () => {
      setTotalFriends(getFriendsFromLocalStorage().length);
    };
    
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      if (event.query.queryKey[0] === 'friendsInfo' || event.query.queryKey[0] === 'leaderboard') {
        updateTotalFriendsCount();
      }
    });
    
    updateTotalFriendsCount(); // Initial call

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);


  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 pt-12 md:pt-16 pb-16"> 
        <div className="flex justify-between items-start mb-8"> {/* Changed items-center to items-start for better alignment with multiline title */}
          <div className="flex items-center"> {/* Added flex container for logo and text, increased gap on md */}
            <ThemeAwareLogo className="h-20 w-20 md:h-24 md:w-24" /> {/* Increased logo size */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">LeetLeague</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Track your friends' LeetCode progress, browse company questions, and stay competitive!
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* The erroneous duplicated block was here and is now removed. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-l-4 border-l-leetcode-purple">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-leetcode-purple" />
                Total Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFriends}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-leetcode-brand">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-leetcode-brand" />
                Submissions Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <Loader2 className="h-7 w-7 animate-spin text-leetcode-brand" />
              ) : errorLeaderboard ? (
                <span className="text-sm text-red-500">Error</span>
              ) : (
                <div className="text-3xl font-bold">{problemsSolvedToday}</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-leetcode-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-leetcode-medium" />
                Your Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Streak calculation is optional and skipped for now */}
              <div className="text-3xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Streak (coming soon)</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="company-questions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Company Questions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LeaderBoard />
              <ActivityFeed />
            </div>
          </TabsContent>
          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityFeed />
          </TabsContent>
          <TabsContent value="company-questions">
            <QuestionViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
