import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCollection } from "../mongodb.server";

export const getLinks = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const collection = await getCollection("links");
      const documents = await collection
        .find({ userId: { $regex: new RegExp(`^${data.userId}$`, "i") } })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`Found ${documents.length} links for user: ${data.userId}`);
      return documents.map(doc => ({
        id: doc._id.toString(),
        alias: doc.alias,
        longUrl: doc.longUrl,
        clicks: doc.clicks,
        createdAt: doc.createdAt,
        active: doc.active,
        history: doc.history,
        visits: doc.visits || [],
      }));
    } catch (error) {
      console.error("Error fetching links:", error);
      return [];
    }
  });

export const createLink = createServerFn({ method: "POST" })
  .validator(z.object({
    alias: z.string().min(1),
    longUrl: z.string().url(),
    userId: z.string(),
  }))
  .handler(async ({ data }) => {
    try {
      const collection = await getCollection("links");
      
      // Check if alias already exists
      const existing = await collection.findOne({ alias: data.alias });
      if (existing) {
        throw new Error("Alias already taken");
      }

      const result = await collection.insertOne({
        ...data,
        clicks: 0,
        active: true,
        createdAt: new Date().toISOString(),
        history: [0, 0, 0, 0, 0, 0, 0],
        visits: [],
      });
      
      return { success: true, id: result.insertedId.toString() };
    } catch (error: any) {
      console.error("Error creating link:", error);
      throw new Error(error.message || "Failed to create link");
    }
  });

export const trackLinkClick = createServerFn({ method: "POST" })
  .validator(z.object({ alias: z.string() }))
  .handler(async ({ data }) => {
    // User agent detection — empty string means device defaults to "Desktop"
    const userAgent = "";
    
    try {
      const collection = await getCollection("links");
      
      const findResult = await collection.findOne({ alias: data.alias });
      if (!findResult || findResult.active === false) return null;

      // Basic device/browser detection
      const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
      const browser = /Chrome/i.test(userAgent) ? "Chrome" : 
                      /Safari/i.test(userAgent) ? "Safari" :
                      /Firefox/i.test(userAgent) ? "Firefox" : "Edge";

      const newVisit = {
        timestamp: new Date().toISOString(),
        device: isMobile ? "Mobile" : "Desktop",
        browser,
        location: "Local", // Simple placeholder, could use geoip later
      };

      // Rotate history: shift left and increment last slot for today
      const existing = await collection.findOne({ alias: data.alias });
      const currentHistory: number[] = existing?.history ?? [0, 0, 0, 0, 0, 0, 0];
      // Shift the array and add 1 to today's slot
      const newHistory = [...currentHistory.slice(1), (currentHistory[6] ?? 0) + 1];

      const link = await collection.findOneAndUpdate(
        { alias: data.alias },
        { 
          $inc: { clicks: 1 },
          $set: { 
            lastVisited: new Date().toISOString(),
            history: newHistory,
          },
          $push: { 
            visits: { 
              $each: [newVisit], 
              $slice: -50
            } 
          }
        } as any,
        { returnDocument: "after" }
      );

      return link?.longUrl || null;
    } catch (error) {
      console.error("Error tracking link:", error);
      return null;
    }
  });

export const deleteLink = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), userId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const { ObjectId } = await import("mongodb");
      const collection = await getCollection("links");
      await collection.deleteOne({ 
        _id: new ObjectId(data.id),
        userId: { $regex: new RegExp(`^${data.userId}$`, "i") }
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting link:", error);
      throw error;
    }
  });

export const updateLinkStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), active: z.boolean(), userId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const { ObjectId } = await import("mongodb");
      const collection = await getCollection("links");
      await collection.updateOne(
        { 
          _id: new ObjectId(data.id),
          userId: { $regex: new RegExp(`^${data.userId}$`, "i") }
        },
        { $set: { active: data.active } }
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  });
