
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Friend } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Award, CheckCircle, Star } from "lucide-react";

interface UserCardProps {
  user: Friend;
  rank?: number;
  className?: string;
}

const UserCard = ({ user, rank, className }: UserCardProps) => {
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-4 flex items-center gap-4">
        {rank && (
          <div className="min-w-8 flex items-center justify-center">
            {rank <= 3 ? (
              <span className="text-xl">{getRankIcon(rank)}</span>
            ) : (
              <span className="text-xl font-bold text-muted-foreground">#{rank}</span>
            )}
          </div>
        )}
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-grow">
          <span className="font-medium">{user.realName || user.username}</span>
          {(user.totalSolved !== undefined || user.streak !== undefined) && (
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {user.totalSolved !== undefined && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{user.totalSolved} solved</span>
                </div>
              )}
              {user.totalSolved !== undefined && user.streak !== undefined && <span>•</span>}
              {user.streak !== undefined && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>{user.streak} day streak</span>
                </div>
              )}
            </div>
          )}
           {/* Display LeetCode ranking if available */}
          {user.ranking !== undefined && user.ranking !== 0 && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Ranking: {user.ranking.toLocaleString()}
            </div>
          )}
        </div>
        {user.solvedToday !== undefined && user.solvedToday > 0 && (
          <div className="ml-auto bg-primary/10 rounded-full px-3 py-1 text-primary font-semibold flex items-center gap-1 text-sm">
            <Award className="h-4 w-4" />
            <span>+{user.solvedToday}</span>
          </div>
        )}
        {/* Fallback for when solvedToday is 0 or undefined, but it's a leaderboard context */}
        {rank !== undefined && user.solvedToday === 0 && (
           <div className="ml-auto text-sm text-muted-foreground px-3 py-1">
             0 today
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
