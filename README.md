# GitHub Profile Clone

A slightly modified visual recreation of GitHub's user profile page (with some additional creative liberty) built with Next.js 15, TypeScript, and Tailwind CSS.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with either:
   
   - `GITHUB_API_KEY` for full access (recommended)
     - To create a GitHub API key (Personal Access Token):
       1. Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
       2. Click "Generate new token (classic)"
       3. Add a note to identify the token
       4. Select the following permissions:
          - `repo` - Full control of private repositories
          - `read:user` - Read access to user profile data
          - `read:project` - Read access to user project data
       5. Copy the generated token and add it to your `.env` file:
         ```
         GITHUB_API_KEY=your_token_here
         ```
   
   - `GITHUB_USERNAME` for public access only
     - Only provides access to public repositories
     - Add to your `.env` file:
       ```
       GITHUB_USERNAME=your_github_username
       ```

4. Run development server: `npm run dev`

## Features Based on Access Level

### With GITHUB_API_KEY
- View all repositories (public and private)
- Access repository details including private forks
- View private repository statistics
- Full profile information

### With GITHUB_USERNAME only
- View public repositories
- Basic public profile information
- Limited repository statistics

## License

MIT
