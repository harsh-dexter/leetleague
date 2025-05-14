
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card components are used for loading/error/empty states
import { Submission } from "@/lib/types";
import { Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFriendsFromLocalStorage } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { format } from 'date-fns'; // For date formatting
import React, { useState } from "react"; // Import useState

// Type for raw API response item
interface RawSubmission {
  id: string; // Added for submission detail link
  title: string;
  titleSlug: string;
  timestamp: string; // API gives string, but it's a Unix timestamp
  username: string; // Added this when processing
}

const fetchRecentSubmissions = async (): Promise<Submission[]> => {
  const friends = getFriendsFromLocalStorage();
  if (friends.length === 0) {
    return [];
  }
  const results = await Promise.all(
    friends.map(async (username) => {
      try {
        const res = await fetch("/.netlify/functions/leetcode", {
          method: "POST",
          body: JSON.stringify({
            query: `
              query recentAcSubmissions($username: String!, $limit: Int!) {
                recentAcSubmissionList(username: $username, limit: $limit) {
                  id # Added to fetch submission ID
                  title
                  titleSlug
                  timestamp
                }
              }
            `,
            variables: { username, limit: 20 },
          }),
        });
        if (!res.ok) {
          console.error(`Failed to fetch submissions for ${username}: ${res.status}`);
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Failed for ${username}: ${errorData?.error || res.statusText}`);
        }
        const result = await res.json();
        if (result.errors) {
          console.error(`GraphQL errors for ${username}:`, result.errors);
           if (result.errors.some((e: any) => e.message?.includes("User matching query does not exist."))) {
            return []; // User not found, return empty for this user
          }
          throw new Error(`GraphQL error for ${username}`);
        }
        // Ensure data and recentAcSubmissionList exist
        const submissionList = result.data?.recentAcSubmissionList;
        if (!Array.isArray(submissionList)) {
          console.warn(`No recent submissions found for ${username} or unexpected data format.`);
          return [];
        }
        return submissionList.map((s: any) => ({
          ...s,
          username,
        }));
      } catch (error) {
         console.error(`Error fetching submissions for ${username}:`, error);
        return []; // Return empty array on error for this user
      }
    })
  );

  const allSubmissionsRaw = results.flat();

  // Fetch difficulty for each submission
  const submissionsWithDifficulty = await Promise.all(
    allSubmissionsRaw.map(async (s) => {
      if (!s || !s.titleSlug) return { ...s, difficulty: undefined }; // Handle cases where s might be an error object from previous map
      try {
        const diffRes = await fetch("/.netlify/functions/leetcode", {
          method: "POST",
          body: JSON.stringify({
            query: `
              query getQuestionDifficulty($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                  difficulty
                }
              }
            `,
            variables: { titleSlug: s.titleSlug },
          }),
        });
        if (!diffRes.ok) {
          console.error(`Failed to fetch difficulty for ${s.titleSlug}: ${diffRes.status}`);
          return { ...s, difficulty: undefined };
        }
        const diffResult = await diffRes.json();
        const difficulty = diffResult.data?.question?.difficulty || undefined;
        return { ...s, difficulty };
      } catch (error) {
        console.error(`Error fetching difficulty for ${s.titleSlug}:`, error);
        return { ...s, difficulty: undefined };
      }
    })
  );

  return submissionsWithDifficulty
    .map((s: RawSubmission & { difficulty?: string }) => ({
      id: `${s.username}-${s.titleSlug}-${s.timestamp}`, // This is the React key
      submissionId: s.id, // This is the LeetCode submission ID
      username: s.username,
      problemId: s.titleSlug,
      problemTitle: s.title,
      timestamp: new Date(parseInt(s.timestamp, 10) * 1000).toISOString(),
      difficulty: s.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const ITEMS_PER_PAGE = 10;

const ActivityFeed = () => {
  const { data: submissions, isLoading, error, refetch } = useQuery<Submission[], Error>({
    queryKey: ["recentSubmissions"],
    queryFn: fetchRecentSubmissions,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = submissions ? Math.ceil(submissions.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubmissions = submissions ? submissions.slice(startIndex, endIndex) : [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-leetcode-purple" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-leetcode-purple" />
          <p className="ml-2">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-leetcode-purple" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading activity: {error.message}</p>
          <button onClick={() => refetch()} className="mt-2 p-2 bg-blue-500 text-white rounded">Retry</button>
        </CardContent>
      </Card>
    );
  }
  
  if (!submissions || submissions.length === 0) {
     return (
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-leetcode-purple" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">No recent activity from friends.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-leetcode-purple" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] pl-6">When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="text-center">Submission</TableHead> 
              <TableHead className="w-[100px] pr-6 text-right">Difficulty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSubmissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="text-sm text-muted-foreground pl-6">
                  {format(new Date(submission.timestamp), "MMM/dd/yyyy HH:mm")}
                </TableCell>
                <TableCell className="font-medium">{submission.username}</TableCell>
                <TableCell>
                  <a
                    href={`https://leetcode.com/problems/${submission.problemId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {submission.problemTitle}
                  </a>
                </TableCell>
                <TableCell className="text-center">
                  {submission.submissionId && (
                    <a
                      href={`https://leetcode.com/submissions/detail/${submission.submissionId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </a>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  {submission.difficulty && (
                    <span
                      className={
                        submission.difficulty === "Easy"
                          ? "problem-easy"
                          : submission.difficulty === "Medium"
                          ? "problem-medium"
                          : "problem-hard"
                      }
                    >
                      {submission.difficulty}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {/* Pagination page number logic */}
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const showPage = Math.abs(pageNum - currentPage) < 2 || pageNum === 1 || pageNum === totalPages;
                const isEllipsisBoundaryBefore = pageNum === 1 && currentPage > 3 && totalPages > 4;
                const isEllipsisBoundaryAfter = pageNum === totalPages && currentPage < totalPages - 2 && totalPages > 4;

                if (isEllipsisBoundaryBefore) {
                   return (
                    <React.Fragment key={`page-${pageNum}-frag-before`}>
                      <PaginationItem>
                        <PaginationLink href="#" onClick={(e) => {e.preventDefault(); setCurrentPage(pageNum);}} isActive={currentPage === pageNum}>
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                    </React.Fragment>
                   );
                }
                if (isEllipsisBoundaryAfter) {
                   return (
                    <React.Fragment key={`page-${pageNum}-frag-after`}>
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" onClick={(e) => {e.preventDefault(); setCurrentPage(pageNum);}} isActive={currentPage === pageNum}>
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                   );
                }
                if (showPage && !(pageNum === 1 && currentPage > 3 && totalPages > 4) && !(pageNum === totalPages && currentPage < totalPages - 2 && totalPages > 4) ) {
                  return (
                    <PaginationItem key={`page-${pageNum}`}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
