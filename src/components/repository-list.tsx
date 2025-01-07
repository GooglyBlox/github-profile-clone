/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  topics: string[];
  language: string | null;
  license: { name: string } | null;
  updated_at: string;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
  archived: boolean;
  is_template: boolean;
  mirror_url: string | null;
  sponsorship: { is_sponsored: boolean } | null;
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  owner: {
    login: string;
  };
  parent?: {
    full_name: string;
    html_url: string;
  } | null;
}

interface LanguageColors {
  [key: string]: {
    color: string;
    url: string;
  };
}

interface RepositoryListProps {
  isPrivateEnabled: boolean;
  searchQuery: string;
}

export function RepositoryList({
  isPrivateEnabled,
  searchQuery: initialSearchQuery,
}: RepositoryListProps) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [languages, setLanguages] = useState<string[]>(["all"]);
  const [languageColors, setLanguageColors] = useState<LanguageColors>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    async function fetchRepositories() {
      try {
        const userResponse = await fetch("/api/github?endpoint=/user");
        const hasApiKey = userResponse.ok;
        let currentUsername = "";

        if (hasApiKey) {
          const userData = await userResponse.json();
          currentUsername = userData.login;
        }

        const reposEndpoint = hasApiKey
          ? "/user/repos?per_page=100"
          : "/user/repos?per_page=100&type=public";

        const reposResponse = await fetch(
          `/api/github?endpoint=${reposEndpoint}`
        );

        if (reposResponse.ok) {
          const data: Repository[] = await reposResponse.json();

          const reposWithParents = hasApiKey
            ? await Promise.all(
                data.map(async (repo) => {
                  if (repo.fork) {
                    const repoDetailResponse = await fetch(
                      `/api/github?endpoint=/repos/${repo.owner.login}/${repo.name}`
                    );
                    if (repoDetailResponse.ok) {
                      const detailData = await repoDetailResponse.json();
                      return { ...repo, parent: detailData.parent };
                    }
                  }
                  return repo;
                })
              )
            : data;

          const filteredRepos = hasApiKey
            ? reposWithParents.filter(
                (repo) =>
                  repo.owner.login.toLowerCase() ===
                    currentUsername.toLowerCase() ||
                  repo.permissions?.admin === true
              )
            : reposWithParents.filter((repo) => !repo.private);

          setRepos(filteredRepos);

          const uniqueLanguages = [
            "all",
            ...new Set(
              filteredRepos
                .map((repo) => repo.language)
                .filter((lang): lang is string => lang !== null)
            ),
          ];
          setLanguages(uniqueLanguages);
        } else {
          setError("Failed to fetch repositories");
        }
      } catch (error) {
        setError("Error fetching repositories");
      } finally {
        setLoading(false);
      }
    }

    fetchRepositories();
  }, []);

  useEffect(() => {
    async function fetchLanguageColors() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json"
        );
        if (response.ok) {
          const colors: LanguageColors = await response.json();
          setLanguageColors(colors);
        }
      } catch (error) {
        console.error("Error fetching language colors:", error);
      }
    }

    fetchLanguageColors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterLanguage, sortBy]);

  const filterRepositories = (repos: Repository[]) => {
    return repos.filter((repo) => {
      const matchesSearch =
        !searchQuery ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage =
        filterLanguage === "all" || repo.language === filterLanguage;
      const matchesType =
        filterType === "all" ||
        (filterType === "public" && !repo.private) ||
        (filterType === "private" && repo.private) ||
        (filterType === "sources" && !repo.fork) ||
        (filterType === "forks" && repo.fork) ||
        (filterType === "archived" && repo.archived) ||
        (filterType === "can be sponsored" && repo.sponsorship?.is_sponsored) ||
        (filterType === "mirrors" && repo.mirror_url !== null) ||
        (filterType === "templates" && repo.is_template);

      return matchesSearch && matchesLanguage && matchesType;
    });
  };

  const sortRepositories = (repos: Repository[]) => {
    return [...repos].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "updated":
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });
  };

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  const hasNonDefaultFilters = (
    filterType: string,
    filterLanguage: string,
    sortBy: string
  ) => {
    return (
      filterType !== "all" || filterLanguage !== "all" || sortBy !== "updated"
    );
  };

  if (loading) {
    return <div className="text-center">Loading repositories...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const visibleRepos = isPrivateEnabled
    ? repos
    : repos.filter((repo) => !repo.private);
  const filteredRepos = sortRepositories(filterRepositories(visibleRepos));

  const totalPages = Math.ceil(filteredRepos.length / ITEMS_PER_PAGE);
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters =
    filterType !== "all" || filterLanguage !== "all" || sortBy !== "updated";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-400 border-b border-gray-800 pb-3">
        <div className="md:hidden flex items-center justify-between w-full">
          <span>{filteredRepos.length} results</span>
          {hasNonDefaultFilters(filterType, filterLanguage, sortBy) && (
            <button
              onClick={() => {
                setFilterType("all");
                setFilterLanguage("all");
                setSortBy("updated");
              }}
              className="text-gray-400 hover:text-white inline-flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Clear filter
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-wrap md:flex-nowrap items-center gap-3">
          <div className="w-full ">
            <Input
              placeholder="Find a repository..."
              className="bg-[#0d1117] border-gray-800 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <Dropdown
              label="Type"
              options={[
                "all",
                "public",
                "private",
                "sources",
                "forks",
                "archived",
                "can be sponsored",
                "mirrors",
                "templates",
              ]}
              value={filterType}
              onChange={setFilterType}
              buttonClassName="border-gray-600 text-gray-300 hover:border-white hover:text-white bg-[#21262d] hover:bg-[#30363d]"
            />
            <Dropdown
              label="Language"
              options={languages}
              value={filterLanguage}
              onChange={setFilterLanguage}
              buttonClassName="border-gray-600 text-gray-300 hover:border-white hover:text-white bg-[#21262d] hover:bg-[#30363d]"
            />
            <Dropdown
              label="Sort"
              options={["updated", "name", "stars"]}
              value={sortBy}
              onChange={setSortBy}
              buttonClassName="border-gray-600 text-gray-300 hover:border-white hover:text-white bg-[#21262d] hover:bg-[#30363d]"
            />
          </div>
        </div>
      </div>

      {hasNonDefaultFilters(filterType, filterLanguage, sortBy) && (
        <div className="hidden md:flex items-center justify-between border rounded-md px-4 py-3 bg-[#161b22] border-[#30363d]">
          <div className="text-sm">
            <span className="text-gray-200">{filteredRepos.length}</span>
            <span className="text-gray-400"> results for </span>
            <span className="text-gray-200">
              {filterType === "all" ? "public" : filterType}
            </span>
            <span className="text-gray-400"> repositories sorted by </span>
            <span className="text-gray-200">{sortBy}</span>
          </div>
          <button
            onClick={() => {
              setFilterType("all");
              setFilterLanguage("all");
              setSortBy("updated");
            }}
            className="text-gray-400 hover:text-white inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#21262d] transition-colors duration-150"
          >
            <X className="h-4 w-4" /> Clear filter
          </button>
        </div>
      )}

      <div className="space-y-6">
        {paginatedRepos.map((repo) => (
          <div key={repo.id} className="pb-6 border-b border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-3">
                    <a
                      href={repo.html_url}
                      className="text-blue-400 hover:underline font-semibold"
                    >
                      {repo.name}
                    </a>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-2 py-0.5 border",
                        repo.archived
                          ? "text-[#d29922] border-[#533d12] bg-transparent"
                          : repo.private
                          ? "text-[#d29922] border-[#533d12] bg-transparent"
                          : "text-[#9198a1] border-[#3d444d] bg-transparent"
                      )}
                    >
                      {repo.archived
                        ? "Public archive"
                        : repo.private
                        ? "Private"
                        : "Public"}
                    </Badge>
                  </div>
                  {repo.fork && repo.parent && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Forked from{" "}
                      <a
                        href={repo.parent.html_url}
                        className="text-gray-400 hover:text-blue-400 hover:underline"
                      >
                        {repo.parent.full_name}
                      </a>
                    </div>
                  )}
                </div>
                {repo.description && (
                  <div className="text-sm text-gray-400">
                    {repo.description}
                  </div>
                )}
                {repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {repo.topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="bg-[#388bfd26] text-[#58a6ff] hover:bg-[#388bfd40]"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            languageColors[repo.language]?.color || "#3b82f6",
                        }}
                      />
                      {repo.language}
                    </span>
                  )}
                  {repo.license && (
                    <span className="flex items-center gap-1.5">
                      <svg
                        aria-hidden="true"
                        height="16"
                        viewBox="0 0 16 16"
                        version="1.1"
                        width="16"
                        className="text-gray-400"
                      >
                        <path
                          fill="currentColor"
                          d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z"
                        />
                      </svg>
                      {repo.license.name}
                    </span>
                  )}
                  <span>
                    Updated {formatRelativeTime(new Date(repo.updated_at))}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-gray-400 gap-1">
                <Star className="h-4 w-4" />
                {repo.stargazers_count.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredRepos.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-center gap-4">
          {currentPage !== 1 ? (
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="text-[#4493f8] border border-transparent hover:border-[#30363d] rounded-md px-3 py-2 text-sm transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
          ) : (
            <span className="text-[#484f58] px-3 py-2 text-sm cursor-default inline-flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Previous
            </span>
          )}
          {currentPage !== totalPages ? (
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="text-[#4493f8] border border-transparent hover:border-[#30363d] rounded-md px-3 py-2 text-sm transition-colors inline-flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-[#484f58] px-3 py-2 text-sm cursor-default inline-flex items-center gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
