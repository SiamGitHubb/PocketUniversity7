// Configuration for MongoDB Atlas Data API
// ==========================================
// 1. Log into MongoDB Atlas (https://cloud.mongodb.com)
// 2. Go to "App Services" -> Create a new App.
// 3. In the side menu, go to "HTTPS Endpoints" (or Data API) and ENABLE it.
// 4. Go to "Users & Authentication" -> "API Keys" -> Create API Key.
// 5. Fill in the details below or set them as Environment Variables in Vercel.

// We use import.meta.env to read environment variables in Vite.
// In Vercel, set these variables in the Settings -> Environment Variables section.
// VITE_MONGO_API_KEY
// VITE_MONGO_APP_ID
// VITE_MONGO_CLUSTER_NAME

// Safely retrieve environment variables to avoid crashes in environments where import.meta.env is undefined
const getEnv = () => {
  try {
    return (import.meta as any).env || {};
  } catch {
    return {};
  }
};

const env = getEnv();

export const MONGO_ENV = {
  // 1. Your API Key (Keep this secret in production!)
  API_KEY: env.VITE_MONGO_API_KEY || '', 
  
  // 2. Your App ID (Found in the Data API settings, looks like 'application-0-xxxxx')
  APP_ID: env.VITE_MONGO_APP_ID || '', 
  
  // 3. Your Cluster Name (e.g. 'Cluster0')
  CLUSTER_NAME: env.VITE_MONGO_CLUSTER_NAME || '', 
  
  // 4. Your Database Name
  DB_NAME: 'pocket_university',
  
  // 5. Your Region URL. 
  // Copy the "Endpoint URL" from your Data API settings page.
  BASE_URL: 'https://data.mongodb-api.com' 
};

export const isMongoConfigured = !!(MONGO_ENV.API_KEY && MONGO_ENV.APP_ID && MONGO_ENV.CLUSTER_NAME);

/**
 * Generic function to make requests to MongoDB Atlas Data API
 */
export async function mongoFetch<T>(action: string, collection: string, body: any = {}): Promise<T> {
  if (!isMongoConfigured) {
    console.warn("MongoDB is not configured. Using Local Storage.");
    throw new Error("MongoDB not configured");
  }

  // Construct URL
  // Note: The Base URL might differ based on region. 
  // Standard format: https://<region>.aws.data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1/action/<action>
  // We assume the user might need to adjust BASE_URL if theirs differs significantly, 
  // but usually it's derived from the App ID region. 
  // For robustness, we will try to use the App ID to form the URL if BASE_URL is generic,
  // OR you can add VITE_MONGO_BASE_URL to env vars.
  
  const baseUrl = env.VITE_MONGO_BASE_URL || `${MONGO_ENV.BASE_URL}/app/${MONGO_ENV.APP_ID}/endpoint/data/v1/action`;
  const url = `${baseUrl}/${action}`;
  
  console.log(`[MongoDB] Requesting ${action} on ${collection}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': MONGO_ENV.API_KEY,
      },
      body: JSON.stringify({
        dataSource: MONGO_ENV.CLUSTER_NAME,
        database: MONGO_ENV.DB_NAME,
        collection: collection,
        ...body
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[MongoDB Error Response]:', errText);
      throw new Error(`MongoDB API Error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[MongoDB Fetch Error]:", error);
    throw error;
  }
}