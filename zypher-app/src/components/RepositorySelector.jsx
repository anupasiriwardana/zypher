"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, GitBranch, Star, Lock, Globe, Search, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { useSession } from "next-auth/react";

const RepositorySelector = ({ onRepositorySelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { data: session } = useSession();

  // Fetch repositories from API
  const fetchRepositories = async () => {
    if (!session?.user) {
      setError("Please sign in to view your repositories");
      return;
    }

    if (session.user.provider !== "github") {
      setError("GitHub authentication required to fetch repositories");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/get-repositories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch repositories");
      }

      const data = await response.json();
      setRepositories(data.repositories || []);
      setFilteredRepos(data.repositories || []);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch repositories when component mounts and user is available
  useEffect(() => {
    if (session?.user && isOpen && repositories.length === 0) {
      fetchRepositories();
    }
  }, [session, isOpen]);

  // Filter repositories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRepos(repositories);
      return;
    }

    const filtered = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [searchTerm, repositories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get language color for display
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      Python: "#3572A5",
      Solidity: "#AA6746",
      Java: "#b07219",
      "C++": "#f34b7d",
      Go: "#00ADD8",
      Rust: "#dea584",
    };
    return colors[language] || "#8b949e";
  };

  const handleRepositoryClick = (repo) => {
    onRepositorySelect?.(repo.html_url);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleDropdownOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && session?.user && repositories.length === 0) {
      fetchRepositories();
    }
  };

  return (
    <div className="relative">
      {/* Select Repository Button */}
      <button
        type="button"
        ref={buttonRef}
        onClick={handleDropdownOpen}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200",
          "hover:bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:ring-opacity-50",
          disabled
            ? "text-[var(--text-secondary)] border-[var(--border-input)] cursor-not-allowed opacity-50"
            : "text-[var(--text-primary)] border-[var(--border-input)] hover:border-[var(--brand-yellow)]"
        )}
      >
        <GitBranch size={16} />
        <span>+ Select Repository</span>
        <ChevronDown
          size={16}
          className={clsx(
            "transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-96 bg-[var(--background)] border border-[var(--border-input)] rounded-xl shadow-xl z-50 animate-fadeIn"
        >
          {/* Search Input */}
          {!isLoading && !error && (
            <div className="p-3 border-b border-[var(--border-input)]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-input)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-6 text-center text-[var(--text-secondary)]">
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading your repositories...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 text-center text-red-400">
              <AlertCircle size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium mb-2">Failed to load repositories</p>
              <p className="text-xs text-[var(--text-secondary)] mb-3">{error}</p>
              <button
                onClick={fetchRepositories}
                className="px-3 py-1 bg-[var(--brand-yellow)] text-[var(--background)] rounded text-xs font-medium hover:brightness-110 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Repository List */}
          {!isLoading && !error && (
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {filteredRepos.length > 0 ? (
                <div className="p-2">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleRepositoryClick(repo)}
                      className="w-full text-left p-3 rounded-lg hover:bg-[var(--input-bg)] transition-colors duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Repository Name */}
                          <div className="flex items-center gap-2 mb-1">
                            {repo.private ? (
                              <Lock size={14} className="text-[var(--text-secondary)] shrink-0" />
                            ) : (
                              <Globe size={14} className="text-[var(--text-secondary)] shrink-0" />
                            )}
                            <span className="font-medium text-[var(--foreground)] truncate group-hover:text-[var(--brand-yellow)]">
                              {repo.name}
                            </span>
                          </div>

                          {/* Description */}
                          {repo.description && (
                            <p className="text-sm text-[var(--text-secondary)] truncate mb-2">
                              {repo.description}
                            </p>
                          )}

                          {/* Meta Information */}
                          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                            {repo.language && (
                              <div className="flex items-center gap-1">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                                />
                                <span>{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Star size={12} />
                              <span>{repo.stargazers_count}</span>
                            </div>
                            <span>Updated {formatDate(repo.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-[var(--text-secondary)]">
                  <p className="text-sm">No repositories found</p>
                  <p className="text-xs mt-1">
                    {searchTerm ? "Try adjusting your search terms" : "No repositories available"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!isLoading && !error && (
            <div className="p-3 border-t border-[var(--border-input)] bg-[var(--input-bg)] rounded-b-xl">
              <p className="text-xs text-[var(--text-secondary)] text-center">
                {searchTerm
                  ? `Showing ${filteredRepos.length} of ${repositories.length} repositories`
                  : `${repositories.length} repositories available`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;