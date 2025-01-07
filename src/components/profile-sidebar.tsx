/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GitHubUser {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  followers: number;
  following: number;
  public_repos: number;
  timezone?: string;
  twitter_username?: string;
}

interface ProfileSidebarProps {
  isPrivateEnabled: boolean;
}

export function ProfileSidebar({ isPrivateEnabled }: ProfileSidebarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchGitHubUser() {
      const apiKey = process.env.NEXT_PUBLIC_GITHUB_API_KEY;
      const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

      if (!apiKey && !username) {
        setError("GitHub credentials not found");
        setLoading(false);
        return;
      }

      try {
        const headers: HeadersInit = {
          Accept: "application/vnd.github.v3+json",
          ...(apiKey && { Authorization: `token ${apiKey}` }),
        };

        const endpoint = apiKey
          ? "https://api.github.com/user"
          : `https://api.github.com/users/${username}`;

        const response = await fetch(endpoint, { headers });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError("Failed to fetch GitHub user data");
        }
      } catch (error) {
        setError("Error fetching GitHub user data");
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubUser();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatUTCOffset = (date: Date) => {
    const offset = -date.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? "+" : "-";
    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="text-center">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {user && (
        <>
          <div className="flex md:block items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 md:h-[260px] md:w-[260px]">
              <Image
                src={user.avatar_url}
                alt="Profile"
                width={260}
                height={260}
                className="rounded-full h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 md:mt-4">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-semibold text-white truncate">
                  {user.name}
                </h1>
                <p className="text-lg md:text-xl text-gray-400 truncate">
                  {user.login}
                </p>
              </div>
              <div className="md:hidden mt-2">
                <p className="text-gray-300 text-sm md:text-base">{user.bio}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-gray-300 text-base">{user.bio}</p>
          </div>

          <div className="hidden md:flex md:items-center md:gap-2">
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              className="text-[#9198a1]"
            >
              <path
                fill="currentColor"
                d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
              />
            </svg>
            <span className="text-sm">
              <span className="text-white">{user.followers}</span>
              <span className="text-gray-400"> followers</span> ·&nbsp;
              <span className="text-white">{user.following}</span>
              <span className="text-gray-400"> following</span>
            </span>
          </div>

          <div className="space-y-3">
            {user.location && (
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  className="text-[#9198a1]"
                >
                  <path
                    fill="currentColor"
                    d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"
                  />
                </svg>
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                className="text-[#9198a1]"
              >
                <path
                  fill="currentColor"
                  d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <span className="text-sm">
                {formatTime(currentTime)} ({formatUTCOffset(currentTime)})
              </span>
            </div>
            {user.blog && (
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  className="text-[#9198a1]"
                >
                  <path
                    fill="currentColor"
                    d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"
                  />
                </svg>
                <a
                  href={user.blog}
                  className="text-sm text-blue-400 hover:underline truncate"
                >
                  {user.blog}
                </a>
              </div>
            )}
            {user.twitter_username && (
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 273.5 222.3"
                  version="1.1"
                  width="16"
                  className="text-[#9198a1]"
                >
                  <path
                    fill="currentColor"
                    d="M273.5 26.3a109.77 109.77 0 0 1-32.2 8.8 56.07 56.07 0 0 0 24.7-31 113.39 113.39 0 0 1-35.7 13.6 56.1 56.1 0 0 0-97 38.4 54 54 0 0 0 1.5 12.8A159.68 159.68 0 0 1 19.1 10.3a56.12 56.12 0 0 0 17.4 74.9 56.06 56.06 0 0 1-25.4-7v.7a56.11 56.11 0 0 0 45 55 55.65 55.65 0 0 1-14.8 2 62.39 62.39 0 0 1-10.6-1 56.24 56.24 0 0 0 52.4 39 112.87 112.87 0 0 1-69.7 24 119 119 0 0 1-13.4-.8 158.83 158.83 0 0 0 86 25.2c103.2 0 159.6-85.5 159.6-159.6 0-2.4-.1-4.9-.2-7.3a114.25 114.25 0 0 0 28.1-29.1"
                  />
                </svg>
                <a
                  href={"https://twitter.com/" + user.twitter_username}
                  className="text-sm hover:underline"
                >
                  {"@" + user.twitter_username}
                </a>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              className="text-[#9198a1]"
            >
              <path
                fill="currentColor"
                d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
              />
            </svg>
            <span className="text-sm">
              <span className="text-white">{user.followers}</span>
              <span className="text-gray-400"> followers</span> ·&nbsp;
              <span className="text-white">{user.following}</span>
              <span className="text-gray-400"> following</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
