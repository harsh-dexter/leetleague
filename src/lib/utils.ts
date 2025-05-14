import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFriendsFromLocalStorage = (): string[] => {
  const friends = localStorage.getItem("friends");
  return friends ? JSON.parse(friends) : [];
};

export const addFriendToLocalStorage = (username: string): string[] => {
  const friends = getFriendsFromLocalStorage();
  if (!friends.includes(username)) {
    const newFriends = [...friends, username];
    localStorage.setItem("friends", JSON.stringify(newFriends));
    return newFriends;
  }
  return friends;
};

export const removeFriendFromLocalStorage = (username: string): string[] => {
  const friends = getFriendsFromLocalStorage();
  const newFriends = friends.filter((friend) => friend !== username);
  localStorage.setItem("friends", JSON.stringify(newFriends));
  return newFriends;
};
