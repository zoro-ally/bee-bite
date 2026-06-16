import { MongoClient, ServerApiVersion } from "mongodb";
import process from "node:process";

// Use a module-level cached promise, but create it lazily inside getDb()
// so that the URI is read at REQUEST time (not import time).
// This is critical for serverless environments (Vercel, Cloudflare Workers)
// where process.env is only populated per-request.
let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in your .env file or Vercel dashboard."
    );
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  clientPromise = client.connect();

  // In development, cache on the global object so HMR doesn't create
  // a new connection pool on every module reload.
  if (process.env.NODE_ENV === "development") {
    (global as any)._mongoClientPromise = clientPromise;
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (globalWithMongo._mongoClientPromise) {
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      globalWithMongo._mongoClientPromise = clientPromise;
    }
  }

  return clientPromise;
}

export async function getDb() {
  const connectedClient = await getClientPromise();
  return connectedClient.db(process.env.MONGODB_DATABASE || "link-blossom");
}

// Helper for quick collection access
export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}
