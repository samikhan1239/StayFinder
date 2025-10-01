import { GoogleGenerativeAI } from "@google/generative-ai";

// Utility function for exponential backoff
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateItinerary({ location, preferences, duration }) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Validate inputs
      if (!location || !preferences || !duration) {
        throw new Error(
          "Missing required parameters: location, preferences, or duration"
        );
      }

      const prompt = `Generate a ${duration}-day travel itinerary for ${location}. Include two activities (one for morning, one for afternoon) and one dinner restaurant per day. Base it on interests: ${preferences.interests.join(
        ", "
      )} and dining preferences: ${preferences.dining.join(
        ", "
      )}. Ensure activities and restaurants are unique across all days and specific to ${location}. Provide a short description (1-2 sentences) for each. Format as:
Day 1:
- Morning: [Activity Name] - [Description]
- Afternoon: [Activity Name] - [Description]
- Dinner: [Restaurant Name] - [Description]
Day 2:
...`;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const itineraryText = result.response.text()?.trim();
      if (!itineraryText) {
        throw new Error("Empty response from Gemini");
      }

      const itinerary = parseItinerary(itineraryText);

      return itinerary;
    } catch (error) {
      if (error.message.includes("429") && retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s

        await delay(waitTime);
        retryCount++;
        continue;
      }
      if (error.message.includes("429")) {
        throw new Error(
          "Gemini rate limit exceeded, please try again later or check your API quota"
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        throw new Error("Invalid Gemini API key or insufficient permissions");
      } else {
        throw new Error("Failed to generate itinerary: " + error.message);
      }
    }
  }
  throw new Error(
    "Failed to generate itinerary after maximum retries due to rate limit"
  );
}

function parseItinerary(text) {
  try {
    const days = text
      .split(/Day \d+:/)
      .slice(1)
      .map((dayText, index) => {
        const lines = dayText
          .split("\n")
          .filter((line) => line.trim() && line.includes(": "));
        const schedule = lines
          .map((line) => {
            const [time, rest] = line.split(": ", 2);
            if (!rest) {
              console.warn("Itinerary: Skipping invalid line:", line);
              return null;
            }
            const [name, description] = rest.split(" - ", 2);
            return {
              time: time.replace(/^- /, "").trim(),
              name: name ? name.trim() : "Unnamed",
              description: description
                ? description.trim()
                : "No description provided",
            };
          })
          .filter((item) => item);
        return { day: `Day ${index + 1}`, schedule };
      })
      .filter((day) => day.schedule.length > 0);

    if (days.length === 0) {
      throw new Error("No valid days parsed from itinerary text");
    }
    return days;
  } catch (error) {
    console.error(
      "Itinerary: Error parsing itinerary:",
      error.message,
      error.stack
    );
    throw error;
  }
}
