// This file is strictly for the server. 
// We use a global check to avoid crashing if bundled into the browser.
const isBrowser = typeof window !== "undefined";

async function getClientPromise(): Promise<any> {
  if (isBrowser) return null;

  // We use globalThis to access process.env without an import
  const uri = (globalThis as any).process?.env?.MONGODB_URI;
  
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  // Double-extra-safe dynamic import
  const { MongoClient, ServerApiVersion } = await import("mongodb");

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  return client.connect();
}

let cachedDb: any = null;

export async function getDb() {
  if (isBrowser) return null;
  if (cachedDb) return cachedDb;

  const connectedClient = await getClientPromise();
  cachedDb = connectedClient.db((globalThis as any).process?.env?.MONGODB_DATABASE || "link-blossom");
  return cachedDb;
}

export async function getCollection(name: string) {
  if (isBrowser) return { 
    find: () => ({ sort: () => ({ toArray: async () => [] }) }),
    findOne: async () => null,
    insertOne: async () => ({ insertedId: "" }),
    findOneAndUpdate: async () => null,
    deleteOne: async () => ({ deletedCount: 0 }),
    updateOne: async () => ({ modifiedCount: 0 }),
  };
  
  const db = await getDb();
  return db.collection(name);
}
