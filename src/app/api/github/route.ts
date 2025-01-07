/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_BASE = "https://api.github.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "No endpoint specified" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GITHUB_API_KEY;
  const username = process.env.GITHUB_USERNAME;

  if (!apiKey && !username) {
    return NextResponse.json(
      { error: "No GitHub credentials configured" },
      { status: 500 }
    );
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      ...(apiKey && { Authorization: `token ${apiKey}` }),
    };

    const finalEndpoint =
      !apiKey && username
        ? endpoint.replace("/user/", `/users/${username}/`)
        : endpoint;

    const response = await fetch(`${GITHUB_API_BASE}${finalEndpoint}`, {
      headers,
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "GitHub API error", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
