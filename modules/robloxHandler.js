/**
 * Fetches the roblox user id's that a specified user has friended
 *
 * This function utilizes the ROBLOX v1 friend endpoint, making batch calls of 50 friends
 * per 1 second to prevent rate limiting
 *
 * @param {number} userId - The ROBLOX id of the user whose friend's to get
 * @returns {Promise<Set<number>>} A promise that resolves into a set of userId's that the given user is friended to
 * @throws {Error} Throws an error if any of the fetches fail
 */
async function returnUsersFriends(userId) {
    // The id's of the user's friends
    const friendIDs = new Set();
    // The url to use for the next fetch operation
    let url = `https://friends.roblox.com/v1/users/${userId}/friends/find?limit=50&cursor=&userSort=`;
    let response = await fetch(url);
    let data = await response.json();
    // Flag for if the fetching should continue
    let hasMore = true;

    // Stop after parsing current page if there is no next page
    while (hasMore) {
        if (response.status != 200) {
            throw new Error("Failed to fetch roblox user's friends");
        }

        // Add each id on the current page to the set
        for (const item of data.PageItems) {
            if (item?.id) {
                friendIDs.add(item.id);
            }
        }

        // If there is another page of data
        if (data.NextCursor) {
            url = `https://friends.roblox.com/v1/users/${userId}/friends/find?limit=50&cursor=${data.NextCursor}&userSort=`;

            // Sleep 1 second per batch of 50 friends to prevent ratelimiting
            await sleep(1000);
            response = await fetch(url);
            data = await response.json();
        } else {
            hasMore = false;
        }
    }

    return friendIDs;
}

/**
 * Get the ROBLOX user id from a ROBLOX user's username
 *
 * @param {string} username - The ROBLOX username that you want the ID for
 * @returns {Promise<number>} A promise that resolves into the roblox user's id
 * @throws {Error} Throws an error if fetch fails or no data is returned
 */
async function getIDByUsername(username) {
    const response = await fetch(
        "https://users.roblox.com/v1/usernames/users",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: true,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch user ID for: " + username);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0 || !data.data[0].id) {
        throw new Error("User not found or no ID for username: " + username);
    }

    return data.data[0].id;
}

/**
 * Get the avatar headshot of a ROBLOX account
 *
 * @param {number} userId - The user id for a ROBLOX profile
 * @returns {string} An image url to an avatar headshot
 * @throws {Error} Throws an error if fetch fails
 */
async function getHeadshot(userId) {
    const response = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`
    );
    const data = await response.json();

    if (response.status != 200) {
        throw new Error("Failed to fetch avatar headshot for: " + userId);
    }

    return data.data[0].imageUrl;
}

/**
 * Get detailed information about a ROBLOX account
 *
 * @param {number} userId - The user id for a ROBLOX profile
 * @returns {Object} An object containing detailed info about the user
 * @throws {Error} Throws an error if the fetch fails
 */
async function getDetailedInfoOfUser(userId) {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const data = await response.json();

    if (response.status != 200) {
        throw new Error("Failed to fetch user info for: " + userId);
    }

    return data;
}

/**
 * Get the age of a ROBLOX account in years
 *
 * @param {number} userId - The user id for a ROBLOX profile
 * @returns {number} The age of the account in years
 */
async function getAccountAgeOfUser(userId) {
    const data = await getDetailedInfoOfUser(userId);

    const accountDate = new Date(data.created);
    const currentDate = new Date();
    const diffMs = currentDate - accountDate;

    return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

/**
 * Get the ROBLOX users that are in a specified group
 *
 * @param {string} groupId - The ID of the group to check
 * @returns {Object} An object containing each member in a group and additional info
 * @throws {Error} Throws an error if the fetch fails
 */
async function getUsersInGroup(groupId) {
    const allMembers = [];
    let url = `https://groups.roblox.com/v1/groups/${groupId}/users?limit=100`;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch users for group: " + groupId);
        }

        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
            allMembers.push(...data.data);
        }

        if (data.nextPageCursor) {
            url = `https://groups.roblox.com/v1/groups/${groupId}/users?limit=100&cursor=${data.nextPageCursor}`;
            await sleep(1000);
        } else {
            hasMore = false;
        }
    }

    return {
        data: allMembers,
        previousPageCursor: null,
        nextPageCursor: null,
    };
}

/**
 * Retrieve the ROBLOX username from a guild member's nickname
 *
 * @param {string} nickname - The discord nickname of a guild member
 * @returns {string|null} A string containing the ROBLOX username of the member, otherwise null
 */
function extractUsername(nickname) {
    const match = nickname.match(/\(([^)]+)\)$/);
    return match ? match[1] : null;
}

/**
 * Retrieve the preferred name of a guild member's nickname. Useful to fall back on if
 * the ROBLOX username doesn't exist
 *
 * @param {string} nickname - The discord nickname of a guild membe
 * @returns {string|null} A string containing the preferred name of the member, otherwise null
 */
function extractNick(nickname) {
    const match = nickname.match(/^(.*?)\s*\(/);
    return match ? match[1].trim() : null;
}

/**
 * Retrieve the ROBLOX id from a guild member's name
 *
 * @param {string} nickname - The member's nickname
 * @returns {Promise<string|null>} The Roblox ID if found, otherwise null
 */
async function getRobloxIDFromNickname(nickname) {
    let memberId = null;

    // Attempt 1: Roblox username from the parentheses in the nickname
    if (extractUsername(nickname)) {
        memberId = await getIDByUsername(extractUsername(nickname))
            .catch(() => null);
    }

    // Attempt 2: The preferred name of the guild member outside of parentheses
    if (!memberId && extractNick(nickname)) {
        memberId = await getIDByUsername(extractNick(nickname))
            .catch(() => null);
    }

    // Attempt 3: Whole nickname of guild member
    if (!memberId && nickname) {
        memberId = await getIDByUsername(nickname)
            .catch(() => null);
    }

    return memberId;
}

/**
 * Pause execution for a specified amount of miliseconds
 *
 * This function returns a promise after a certain amnount of miliseconds, letting the caller of
 * this function use await to await that many seconds
 *
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A Promise that resolves after the delay.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
    returnUsersFriends,
    getIDByUsername,
    getHeadshot,
    getDetailedInfoOfUser,
    getAccountAgeOfUser,
    getUsersInGroup,
    extractUsername,
    extractNick,
    getRobloxIDFromNickname,
};
