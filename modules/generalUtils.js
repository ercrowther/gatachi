/**
 * Given a date object, return a string such as '1 min ago', '3 hours ago', etc depending on the time
 * from the current date
 *
 * @param {Date} date - A javascript date object
 * @returns {string} A string containing the 'time ago'
 */
function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " min" + (interval > 1 ? "s" : "") + " ago";
    }

    return seconds + " second" + (seconds !== 1 ? "s" : "") + " ago";
}

module.exports = { timeAgo };
