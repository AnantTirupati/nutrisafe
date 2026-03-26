/**
 * Performs a search on Serper.dev (Google Search API) to find product information.
 * Targets Amazon.in and BigBasket specifically for Indian products.
 */
export async function searchProductOnWeb(barcode: string): Promise<string> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error("SERPER_API_KEY not set");
    return "";
  }

  const query = `site:amazon.in OR site:bigbasket.com OR site:blinkit.com "${barcode}"`;
  
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "in", // Focus on India
      }),
    });

    if (!response.ok) {
        // Fallback to broad search if specific sites fail
        return searchProductBroadly(barcode, apiKey);
    }

    const data = await response.json();
    const results: string[] = [];

    if (data.organic && Array.isArray(data.organic)) {
      for (let i = 0; i < Math.min(data.organic.length, 5); i++) {
        const item = data.organic[i];
        results.push(`Result ${i + 1}: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}`);
      }
    }

    if (results.length === 0) {
      return searchProductBroadly(barcode, apiKey);
    }

    return results.join("\n\n");
  } catch (error) {
    console.error("Serper search error:", error);
    return "";
  }
}

async function searchProductBroadly(barcode: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: `${barcode} product name India`,
        gl: "in",
      }),
    });

    const data = await response.json();
    const results: string[] = [];

    if (data.organic && Array.isArray(data.organic)) {
      for (let i = 0; i < Math.min(data.organic.length, 5); i++) {
        const item = data.organic[i];
        results.push(`Result ${i + 1}: ${item.title}\nSnippet: ${item.snippet}`);
      }
    }

    return results.join("\n\n");
  } catch {
    return "";
  }
}
