import fetch from "node-fetch";

export const handler = async (event: any) => {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const makeRequest = async (item: { query: string, variables: any }) => {
    const { query, variables } = item;
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "LeetCode-Friends-Tracker/1.0",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`LeetCode API request failed: ${res.status} ${res.statusText}`, errorText);
      // For batch requests, we don't want to fail the whole batch, so return an error object
      return { error: `LeetCode API Error: ${res.statusText}`, details: errorText };
    }
    return res.json();
  };

  try {
    if (Array.isArray(body)) {
      // Batch request
      const results = await Promise.all(body.map(makeRequest));
      return {
        statusCode: 200,
        body: JSON.stringify(results),
      };
    } else {
      // Single request
      const result = await makeRequest(body) as any;
      if (result.error) {
         return {
            statusCode: 500, // Or a more specific error code if available
            body: JSON.stringify(result),
         }
      }
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }
  } catch (error: any) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
