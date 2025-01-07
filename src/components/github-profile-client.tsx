/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ProfileSidebar } from "./profile-sidebar";
import { RepositoryList } from "./repository-list";

export function GitHubProfileClient() {
  const [isPrivateEnabled, setIsPrivateEnabled] = useState<boolean | null>(
    null
  );
  const [credentialsChecked, setCredentialsChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkGitHubAccess() {
      try {
        const response = await fetch("/api/github?endpoint=/user");
        setIsPrivateEnabled(response.ok);
      } catch (error) {
        setIsPrivateEnabled(false);
        setError("Failed to check GitHub access");
      } finally {
        setCredentialsChecked(true);
      }
    }

    checkGitHubAccess();
  }, []);

  if (!credentialsChecked) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-300 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 p-8 rounded-lg border border-gray-800 bg-[#161b22]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-3 w-full">
            <div className="h-3 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-4/6 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-3 text-gray-500 text-sm">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading profile data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-300 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {isPrivateEnabled !== null ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProfileSidebar isPrivateEnabled={!!isPrivateEnabled} />
            <div className="md:col-span-3">
              <RepositoryList
                isPrivateEnabled={!!isPrivateEnabled}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              Unable to access GitHub API. Please check your server
              configuration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
