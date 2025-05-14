import fetch from "node-fetch";

export const handler = async (event: any) => {
  // Ensure event.body is parsed if it's a string
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const { query, variables } = body;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // It's good practice to set a User-Agent
        "User-Agent": "LeetCode-Friends-Tracker/1.0",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      // Log more details for non-OK responses
      const errorText = await res.text();
      console.error(`LeetCode API request failed: ${res.status} ${res.statusText}`, errorText);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `LeetCode API Error: ${res.statusText}`, details: errorText }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
