import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";

/**
 * Get an existing user from the database by Appwrite account ID
 */
export const getExistingUser = async (id: string) => {
    try {
        const { documents, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        );
        return total > 0 ? documents[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

/**
 * Store user data after login (Google OAuth or standard login)
 */
export const storeUserData = async () => {
    try {
        // Ensure the user is logged in
        let user;
        try {
            user = await account.get();
        } catch {
            console.log("No user session found, redirecting to sign-in...");
            return redirect("/sign-in");
        }

        // Try to get Google profile picture if available
        const session = await account.getSession("current").catch(() => null);
        const providerAccessToken = session?.providerAccessToken;
        const profilePicture = providerAccessToken ? await getGooglePicture(providerAccessToken) : null;

        // Check if user already exists
        const existingUser = await getExistingUser(user.$id);
        if (!existingUser) {
            await database.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                {
                    accountId: user.$id,
                    email: user.email,
                    name: user.name,
                    imageUrl: profilePicture,
                    joinedAt: new Date().toISOString(),
                }
            );
        }
    } catch (error) {
        console.error("Error storing user data:", error);
    }
};

/**
 * Fetch Google profile picture
 */
const getGooglePicture = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch Google profile picture");

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

/**
 * Login using Google OAuth
 */
export const loginWithGoogle = async () => {
    try {
        account.createOAuth2Session(
            OAuthProvider.Google,
            `${window.location.origin}/`,
            `${window.location.origin}/404`
        );
    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

/**
 * Get currently logged-in user data
 * Redirects to /sign-in if not authenticated
 */
export const getUser = async () => {
    try {
        let user;
        try {
            user = await account.get();
        } catch {
            console.log("No active session, redirecting...");
            return redirect("/sign-in");
        }

        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
            ]
        );

        return documents.length > 0 ? documents[0] : redirect("/sign-in");
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        );

        return { users: users || [], total: total || 0 };
    } catch (error) {
        console.error("Error fetching all users:", error);
        return { users: [], total: 0 };
    }
};
