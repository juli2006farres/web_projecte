function updateClock() {
    const timeElement = document.getElementById('current-time');
    if (!timeElement) return;

    const now = new Date();

    // Format the date: day/month/year
    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are 0-based
    const year = now.getFullYear();

    // Format the time: hour:minute:second
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // Combine date and time
    const formattedDateTime = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;

    // Update the element
    timeElement.textContent = formattedDateTime;
}

// Update the clock immediately so there's no delay
updateClock();

// Set an interval to update the clock every second (1000 milliseconds)
setInterval(updateClock, 1000);
