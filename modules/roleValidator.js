/**
 * Given both a member and an array of role id's that the member may or may not have, check if the member has those role's or not
 *
 * @param {GuildMember} member - The GuildMember, typically from an interaction
 * @param {string[]} roleIds - A string array of roleId's to check if the member has or not
 * @returns {{ invalidIds: string[], validIds: string[] }} - Two arrays, one for invalid roles found, and one for valid roles found
 */
function validateRolesForMember(member, roleIds) {
    // Arrays to hold both valid and invalid role id's found for a member
    const invalidIds = [];
    const validIds = [];

    try {
        for (const roleId of roleIds) {
            // Only continue with the command if the user possesses the game server access role
            if (!member.roles.cache.has(roleId)) {
                invalidIds.push(roleId);
            } else {
                validIds.push(roleId);
            }
        }

        return { invalidIds, validIds };
    } catch (error) {
        // Throw the error again so the caller can handle it meaningfully
        throw new Error("Failed to validate roles: " + error.message);
    }
}

module.exports = { validateRolesForMember };
