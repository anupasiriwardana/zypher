import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { checkRoleAccess } from "@/app/api/_services/requestValidationService";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = ['primary-user'];
    const accessError = await checkRoleAccess(allowedRoles, role, userId);
    if (accessError) {
        return NextResponse.json(
            { error: accessError.error },
            { status: accessError.status }
        );
    }
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized - Please sign in" },
                { status: 401 }
            );
        }

        // Check if user signed in with GitHub
        if (session.user.provider !== "github") {
            return NextResponse.json(
                { error: "GitHub authentication required to fetch repositories" },
                { status: 400 }
            );
        }

        const githubAccessToken = session.githubAccessToken;

        if (!githubAccessToken) {
            return NextResponse.json(
                { error: "GitHub access token not available. Please sign out and sign in again with GitHub." },
                { status: 400 }
            );
        }

        // Fetch repositories from GitHub API using the access token
        const response = await fetch(
            `https://api.github.com/user/repos?sort=updated&per_page=100&type=all`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${githubAccessToken}`,
                    'User-Agent': 'Zypher-Security-Scanner',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const repositories = await response.json();

        // Transform the GitHub API response to match our component's expected format
        const formattedRepos = repositories.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            clone_url: repo.clone_url,
            description: repo.description,
            private: repo.private,
            stargazers_count: repo.stargazers_count,
            language: repo.language,
            updated_at: repo.updated_at,
            topics: repo.topics || [],
            default_branch: repo.default_branch,
            owner: {
                login: repo.owner.login,
                avatar_url: repo.owner.avatar_url,
            }
        }));

        return NextResponse.json({
            success: true,
            repositories: formattedRepos,
            total_count: repositories.length,
            source: 'authenticated_api'
        });

    } catch (error) {
        console.error("Error fetching repositories:", error);
        return NextResponse.json(
            { error: "Failed to fetch repositories", details: error.message },
            { status: 500 }
        );
    }
}
