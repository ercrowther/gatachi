function validateAndFormatDate(dateStr) {
    const date = new Date(dateStr);

    // Check if the date is invalid
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format. Must be yyyy-mm-dd");
    }

    // Format the date into 'yyyy-mm-dd' format
    const formattedDate = date.toISOString().split("T")[0];

    return formattedDate;
}

module.exports = { validateAndFormatDate };
