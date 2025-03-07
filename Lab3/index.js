document.getElementById("start-game").addEventListener("click", function () {
    alert("Добро пожаловать в игру 'Угадай число'!");

    let secretNumber = Math.floor(Math.random() * 200) + 1; // Загадано число от 1 до 100
    let attempts = 0;
    let guessed = false;

    while (!guessed) {
        let userInput = prompt("Введите число от 1 до 200:");

        if (userInput === null) {
            alert("Вы вышли из игры.");
            return;
        }

        let guess = parseInt(userInput);

        if (isNaN(guess)) {
            alert("Ошибка! Введите число!");
            continue;
        }

        if (guess < 1 || guess > 200) {
            alert("Число должно быть в диапазоне от 1 до 200.");
            continue;
        }

        attempts++;

        if (guess > secretNumber) {
            alert("Загаданное число меньше!");
        } else if (guess < secretNumber) {
            alert("Загаданное число больше!");
        } else {
            guessed = true;
            alert(`Поздравляем! Вы угадали число ${secretNumber} за ${attempts} попыток.`);
            let playAgain = confirm("Хотите сыграть еще раз?");
            if (playAgain) {
                location.reload();
            } else {
                alert("Спасибо за игру!");
            }
        }
    }
});