import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubUserData } from '@/app/lib/github-service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const data = await fetchGitHubUserData(username);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch GitHub data' },
            { status: error.message?.includes('rate limit') ? 429 : 500 }
        );
    }
}
