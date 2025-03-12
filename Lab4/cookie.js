function saveReviewToCookie(review) {
    const reviews = getReviewsFromCookie();
    reviews.push(review);
    document.cookie = `reviews=${JSON.stringify(reviews)}; path=/`;
}

// Функция для получения отзывов из cookie
function getReviewsFromCookie() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('reviews='));
    return cookie ? JSON.parse(cookie.split('=')[1]) : [];
}