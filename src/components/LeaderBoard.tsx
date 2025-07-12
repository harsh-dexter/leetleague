
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCard from "./UserCard";
import { Trophy, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { getFriendsFromLocalStorage } from "@/lib/utils";
import { Friend } from "@/lib/types";
import { fetchLeetCodeData } from "@/services/leetcode";

interface LeaderboardEntry {
  username: string;
  solvedToday: number;
  id: string;
  avatar?: string;
}

interface CachedFriendInfo extends Friend {
  // id, username, realName, avatar, ranking, totalSolved
}

const fetchLeaderBoardSolvedToday = async (): Promise<Omit<LeaderboardEntry, 'avatar'>[]> => {
  const friends = getFriendsFromLocalStorage();
  if (friends.length === 0) {
    return [];
  }
  const today = new Date();
  const todayUtcMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const todayTs = Math.floor(todayUtcMidnight.getTime() / 1000);
  const currentYear = today.getUTCFullYear();

  const requests = friends.map(username => ({
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
  }));

  const results = await fetchLeetCodeData(requests) as any[];

  const data = results.map((calendarResult, index) => {
    const username = friends[index];
    let solvedToday = 0;
    if (calendarResult.errors || !calendarResult.data?.matchedUser?.userCalendar?.submissionCalendar) {
      console.warn(`Leaderboard: GraphQL error or missing calendar for ${username}:`, calendarResult.errors, calendarResult.data);
      if (calendarResult.data?.matchedUser === null || calendarResult.errors?.some((e: any) => e.message?.includes("User matching query does not exist."))) {
          return { username, solvedToday: 0, id: username, error: "User not found or no calendar" };
      }
      // If other errors but user/calendar structure exists, log and return 0 for this user
      console.warn(`Leaderboard: GraphQL error or missing calendar for ${username} (but user might exist):`, calendarResult.errors, calendarResult.data);
    } else {
      const calendarStr = calendarResult.data.matchedUser.userCalendar.submissionCalendar;
      const calendar = JSON.parse(calendarStr || "{}");
      solvedToday = calendar[todayTs.toString()] || 0;
    }
    return { username, solvedToday, id: username };
  });
  return data
    .filter(entry => !entry.error || entry.error === "User not found or no calendar") 
    .sort((a, b) => b.solvedToday - a.solvedToday);
};


const LeaderBoard = () => {
  const queryClient = useQueryClient();
  const { data: solvedTodayData, isLoading, error, refetch } = useQuery<Omit<LeaderboardEntry, 'avatar'>[], Error>({
    queryKey: ["leaderboardSolvedToday"], 
    queryFn: fetchLeaderBoardSolvedToday,
  });

  const friendsInfo = queryClient.getQueryData<CachedFriendInfo[]>(["friendsInfo"]);
  const friendsAvatarMap = new Map<string, string | undefined>();
  if (friendsInfo) {
    friendsInfo.forEach(friend => {
      if (friend.username && friend.avatar) {
        friendsAvatarMap.set(friend.username, friend.avatar);
      }
    });
  }

  // Ensure solvedTodayData is not undefined before mapping
  const leadersWithAvatars: LeaderboardEntry[] = solvedTodayData
    ? solvedTodayData.map(leader => ({
        ...leader,
        avatar: friendsAvatarMap.get(leader.username),
      })).filter(leader => friendsAvatarMap.has(leader.username) || leader.solvedToday > 0) // Keep if avatar or has solved today
    : [];


  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-leetcode-brand" />
            Today's Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-leetcode-brand" />
          <p className="ml-2">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-leetcode-brand" />
            Today's Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading leaderboard: {error.message}</p>
          <button onClick={() => refetch()} className="mt-2 p-2 bg-blue-500 text-white rounded">Retry</button>
        </CardContent>
      </Card>
    );
  }

  if (!leadersWithAvatars || leadersWithAvatars.length === 0) { // Use leadersWithAvatars here
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-leetcode-brand" />
            Today's Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No friends with activity found, or friend data still loading.</p>
          <p className="text-sm text-muted-foreground">Ensure friends are added and their profiles are fetched.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-leetcode-brand" />
          Today's Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leadersWithAvatars.map((leader, index) => (
            <UserCard
              key={leader.id}
              user={{ // Constructing the Friend object for UserCard
                id: leader.id,
                username: leader.username,
                solvedToday: leader.solvedToday,
                avatar: leader.avatar,
              }}
              rank={index + 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderBoard;
