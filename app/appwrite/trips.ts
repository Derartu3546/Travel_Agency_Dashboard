import { appwriteConfig, database } from "~/appwrite/client";
import { Query } from "appwrite";

/**
 * Get all trips with pagination
 */
export const getAllTrips = async (limit: number, offset: number) => {
    try {
        const response = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc("$createdAt"),
            ]
        );

        return {
            allTrips: response.documents,
            total: response.total,
        };
    } catch (error) {
        console.error("Error fetching trips:", error);

        return {
            allTrips: [],
            total: 0,
        };
    }
};

/**
 * Get a single trip by ID
 */
export const getTripById = async (tripId: string) => {
    try {
        const trip = await database.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId
        );

        return trip;
    } catch (error) {
        console.log("Trip not found:", tripId);
        return null;
    }
};
