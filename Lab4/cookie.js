function addReview() {
    const name = document.getElementById('review-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const image = document.getElementById('review-image').files[0];

    if (!name || !text || isNaN(rating) || rating < 1 || rating > 5) {
        alert('Пожалуйста, заполните все поля корректно.');
        return;
    }

    const review = {
        name,
        text,
        rating,
        image: image ? URL.createObjectURL(image) : null,
        date: new Date()
    };

    saveReviewToCookie(review);
    displayReview(review);

    // Очистка формы
    document.getElementById('review-name').value = '';
    document.getElementById('review-text').value = '';
    document.getElementById('review-rating').value = '';
    document.getElementById('review-image').value = '';
}