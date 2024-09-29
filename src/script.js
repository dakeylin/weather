const apiKey = "fcd70cd1fb1369d949e84a2693cbaba4";
const apiUrl = `https://ru.api.openweathermap.org/data/2.5/weather?units=metric&q=`;

let timezone;
let previousInterval = null;

const cityButton = document.getElementById("city");
const cityModal = document.getElementById("city-modal");
const closeModalButton = document.getElementById("cityClose");
const checkWeatherBtn = document.getElementById("checkWeatherBtn");

async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}`);
    }
    const data = await response.json();
    document.querySelector(".temp").innerHTML =
      Math.round(data.main.temp) + "&#8451";
    document.querySelector("#city").innerHTML = data.name;
    document.querySelector(".humidity").innerHTML =
      "Влажность " + data.main.humidity + "%";
    document.querySelector(".wind").innerHTML =
      "Скорость ветра " + data.wind.speed + " Км/ч";
    timezone = data.timezone;
    setInterval(getTime, 1000);
    getCurrentDateFormatted();
    return timezone;
  } catch (error) {
    console.error(`Ошибка при получении данных:`, error);
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await fetch(
          `https://ru.api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        await checkWeather(data.name);
      },
      () => {
        checkWeather("Краснодар");
      }
    );
  } else {
    checkWeather("Краснодар");
  }
}

document
  .getElementById("checkWeatherBtn")
  .addEventListener("click", function () {
    const city = document.getElementById("cityInput").value;
    checkWeather(city);
    document.getElementById("city-modal").style.display = "none";
  });

document
  .getElementById("cityInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const city = document.getElementById("cityInput").value;
      checkWeather(city);
      document.getElementById("city-modal").style.display = "none";
    }
  });

getLocation();

cityButton.addEventListener("click", () => {
  cityModal.style.display = "block";
});

closeModalButton.addEventListener("click", () => {
  cityModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target == cityModal) {
    cityModal.style.display = "none";
  }
});

function getTime() {
  const nowUtc = new Date();
  const offsetInMilliseconds = timezone * 1000;
  const localTime = new Date(nowUtc.getTime() + offsetInMilliseconds);
  const options = {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("ru-RU", options);
  const formattedTime = formatter.format(localTime);
  document.querySelector(".time").innerHTML = formattedTime;

  //Смена изображения
  const currentHour = localTime.getUTCHours();
  let currentInterval;
  if (currentHour >= 0 && currentHour < 6) {
    currentInterval = 1;
  } else if (currentHour >= 6 && currentHour < 12) {
    currentInterval = 2;
  } else if (currentHour >= 12 && currentHour < 18) {
    currentInterval = 3;
  } else {
    currentInterval = 4;
  }

  if (currentInterval !== previousInterval) {
    let imageUrl;
    switch (currentInterval) {
      case 1:
        imageUrl = "/src/images/01.jpg";
        break;
      case 2:
        imageUrl = "/src/images/02.jpg";
        break;
      case 3:
        imageUrl = "/src/images/03.jpg";
        break;
      case 4:
        imageUrl = "/src/images/04.jpg";
        break;
    }
    const imageElement = document.querySelector(".image");
    if (imageElement) {
      imageElement.src = imageUrl;
    }
    previousInterval = currentInterval;
  }
}

function getCurrentDateFormatted() {
  const nowUtc = new Date();
  const offsetInMilliseconds = timezone * 1000;
  const localTime = new Date(nowUtc.getTime() + offsetInMilliseconds);
  const options = {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  const formatter = new Intl.DateTimeFormat("ru-RU", options);
  const formattedDate = formatter.format(localTime);

  const [dayOfWeek, day, month] = formattedDate.split(" ");
  const result = `${dayOfWeek} ${day} ${month}`;

  document.querySelector(".day").innerHTML = result;
}

const focusModal = document.getElementById("focus-modal");
const focusBtn = document.getElementById("focus-btn");
const closeFocus = document.getElementById("closeFocus");
const timerDisplay = document.getElementById("timerDisplay");
const startButton = document.getElementById("startTimer");
const pauseButton = document.getElementById("pauseTimer");
const resumeButton = document.getElementById("resumeTimer");

let timer;
let timeLeft;
let isPaused = false;
const audio = document.getElementById("audio");

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.innerHTML = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  if (timeLeft > 0 && !isPaused) {
    timeLeft--;
  } else if (timeLeft <= 0) {
    clearInterval(timer);
    audio.pause();
    alert("Время вышло!");
    startButton.innerHTML = "Запустить таймер";
  }
}

focusBtn.onclick = function () {
  focusModal.style.display = "block";
  timeLeft = 30 * 60;
  updateTimer();
};

closeFocus.onclick = function () {
  focusModal.style.display = "none";
  clearInterval(timer);
  audio.pause();
  startButton.innerHTML = "Запустить таймер";
};

window.addEventListener("click", (event) => {
  if (event.target == focusModal) {
    focusModal.style.display = "none";
    clearInterval(timer);
    audio.pause();
    startButton.innerHTML = "Запустить таймер";
  }
});

startButton.addEventListener("click", () => {
  if (startButton.innerHTML === "Запустить таймер") {
    clearInterval(timer);
    isPaused = false;
    timer = setInterval(updateTimer, 1000);
    startButton.innerHTML = "Остановить таймер";
    audio.play();
  } else {
    clearInterval(timer);
    audio.pause();
    startButton.innerHTML = "Запустить таймер";
  }
});

if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    isPaused = true;
    audio.pause();
  });
}

if (resumeButton) {
  isPaused = false;
  audio.play();
}


const plannerBtn = document.getElementById("planner-btn");
const plannerModal = document.getElementById("plannerModal"); // Убедитесь, что у вас есть этот элемент
const closePlanner = document.getElementById("close-planner");
const btnBox = document.getElementById("btn-box");
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

plannerBtn.onclick = function () {
  plannerModal.style.display = "block";
};

closePlanner.onclick = function () {
  plannerModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == plannerModal) {
    plannerModal.style.display = "none";
  }
};

btnBox.addEventListener("click", addTask);
inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  if (inputBox.value !== "") {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7"; // Символ "×"
    li.appendChild(span);
  } else {
    alert("Введите новую задачу");
  }
  inputBox.value = '';
  saveData();
}

listContainer.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("checked");
    saveData();
  } else if (event.target.tagName === "SPAN") {
    event.target.parentElement.remove();
    saveData();
  }
}, false);

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  const data = localStorage.getItem("data");
  if (data) {
    listContainer.innerHTML = data;
  }
}

showTask();