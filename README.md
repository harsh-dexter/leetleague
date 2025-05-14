# LeetLeague

LeetLeague is a web application that allows you to track the LeetCode progress of your friends, view leaderboards, and see recent activity. It uses the LeetCode GraphQL API (via a Netlify serverless function proxy) to fetch real-time data.

## Features

-   **Friend Tracking**: Add LeetCode usernames to track. Friends are stored in `localStorage`.
-   **Leaderboard**: View a daily leaderboard based on problems solved today by your tracked friends.
-   **Activity Feed**: See a paginated list of recent submissions from your friends, including problem name and link.
-   **User Profiles**: View basic profile information for friends, including avatar and ranking (in Friends List).
-   **Stats**: Overview stats for total friends and total problems solved today by the group.
-   **Dark Mode**: Toggle between light and dark themes. Theme preference is saved.
-   **Responsive Design**: Built with Tailwind CSS and ShadCN UI for a responsive experience.

## Technologies Used

-   **Vite**: Frontend tooling, development server.
-   **React**: JavaScript library for building user interfaces.
-   **TypeScript**: Superset of JavaScript adding static typing.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **ShadCN UI**: Re-usable UI components built with Radix UI and Tailwind CSS.
-   **React Query**: For data fetching, caching, and state management of server state.
-   **Netlify Functions**: For serverless backend (proxy to LeetCode API).
-   **date-fns**: For date formatting.
-   **lucide-react**: For icons.

## Setup and Running Locally

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm (comes with Node.js)

### Steps

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_REPOSITORY_URL>
    cd <PROJECT_DIRECTORY_NAME>
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```
    This will install all necessary packages, including `netlify-cli` as a dev dependency.

3.  **Run the Netlify development server:**
    The application uses Netlify Functions to proxy requests to the LeetCode API. The Netlify Dev environment runs these functions locally and serves your Vite frontend.
    ```sh
    npx netlify dev
    ```
    This command typically does the following:
    -   Starts the Netlify server (usually on port `8888`, as configured in `netlify.toml`).
    -   Runs your serverless functions (from `netlify/functions`).
    -   Detects and starts your Vite development server (configured as `npm run dev` on `targetPort: 8080` in `netlify.toml`).

    You should access the application through the Netlify Dev URL (e.g., `http://localhost:8888`).

4.  **If Vite doesn't start automatically via Netlify Dev (or for separate frontend development):**
    In a separate terminal, you can run the Vite development server directly:
    ```sh
    npm run dev
    ```
    This will usually start on `http://localhost:5173` (Vite's default) or `http://localhost:8080` if configured in `vite.config.ts`. However, to ensure the serverless functions are accessible, always use the URL provided by `npx netlify dev` for full application testing.

## How to Use

-   Once the application is running, you can add LeetCode usernames of friends you want to track using the "Add Friend" button on the "Friends" tab.
-   The dashboard will show a leaderboard of problems solved today and a combined activity feed.
-   You can toggle between light and dark themes using the sun/moon icon in the header.

## Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains the necessary build commands and function settings.
-   **Build command**: `npm run build`
-   **Publish directory**: `dist`
-   **Functions directory**: `netlify/functions`

Connect your Git repository to a Netlify site to enable automatic deployments.
