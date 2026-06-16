import process from "node:process";

// Module-level cached promise for the connection
let clientPromise: Promise<any> | undefined;

async function getClientPromise(): Promise<any> {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in your .env file or Vercel dashboard."
    );
  }

  // Dynamic import ensures the 'mongodb' package is ONLY loaded on the server
  // and completely ignored by the browser bundler.
  const { MongoClient, ServerApiVersion } = await import("mongodb");

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  clientPromise = client.connect();

  // Development caching for HMR
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<any>;
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

export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}
