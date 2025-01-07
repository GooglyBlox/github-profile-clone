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

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GITHUB_API_KEY;

    setIsPrivateEnabled(!!apiKey);
    setCredentialsChecked(true);
  }, []);

  if (!credentialsChecked) {
    return null;
  }

  const hasCredentials =
    isPrivateEnabled || process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300">
      <div className="border-b border-gray-800 py-4 hidden md:block">
        <div className="max-w-6xl mx-auto px-6">
          <Input
            placeholder="Find a repository..."
            className="bg-[#0d1117] border-gray-800 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-6">
        {hasCredentials ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProfileSidebar isPrivateEnabled={!!isPrivateEnabled} />
            <div className="md:col-span-3">
              <div className="md:hidden mb-6">
                <Input
                  placeholder="Find a repository..."
                  className="bg-[#0d1117] border-gray-800 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <RepositoryList
                isPrivateEnabled={!!isPrivateEnabled}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              GitHub credentials not found. Please set either
              NEXT_PUBLIC_GITHUB_API_KEY for full access or
              NEXT_PUBLIC_GITHUB_USERNAME for public access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
