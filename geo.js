const TARGET_LATITUDE = 40.69335958934216;
const TARGET_LONGITUDE = -73.98806824916387;
const UNLOCK_RADIUS_METERS = 100;

const landing = document.querySelector("#landing");
const quiz = document.querySelector("#quiz");
const locked = document.querySelector("#locked");
const reveal = document.querySelector("#reveal");
const questionCount = document.querySelector("#question-count");
const questionText = document.querySelector("#question-text");
const questionCategory = document.querySelector("#question-category");
const optionsContainer = document.querySelector("#options");
const answerButton = document.querySelector("#answer-button");
const locationStatus = document.querySelector("#location-status");
const accuracyDisplay = document.querySelector("#accuracy");
const checkButton = document.querySelector("#check-button");

let roundQuestions = [];
let guesses = [];
let currentQuestion = 0;
let consecutiveInRangeReadings = 0;
let checkingLocation = false;
let unlocked = false;

function shuffle(items) {
    const shuffled = items.slice();
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const otherIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
    }
    return shuffled;
}

function chooseRound() {
    const categories = [...new Set(question_pool.map((item) => item.category))];
    const chosen = categories.map((category) => {
        const inCategory = question_pool.filter((item) => item.category === category);
        return inCategory[Math.floor(Math.random() * inCategory.length)];
    });
    const remaining = question_pool.filter((item) => !chosen.includes(item));
    const extra = remaining[Math.floor(Math.random() * remaining.length)];
    return shuffle([...chosen, extra]).map((item) => ({
        ...item,
        options: shuffle(item.options)
    }));
}

function showOnly(section) {
    landing.hidden = section !== landing;
    quiz.hidden = section !== quiz;
    locked.hidden = section !== locked;
    reveal.hidden = section !== reveal;
}

function startRound() {
    roundQuestions = chooseRound();
    guesses = [];
    currentQuestion = 0;
    accuracyDisplay.textContent = "";
    showOnly(quiz);
    renderQuestion();
}

function renderQuestion() {
    const item = roundQuestions[currentQuestion];
    questionCount.textContent = `Question ${currentQuestion + 1} of ${roundQuestions.length}`;
    questionText.textContent = item.question;
    questionCategory.textContent = item.category;
    answerButton.disabled = true;
    answerButton.textContent = currentQuestion === roundQuestions.length - 1
        ? "Lock in answer"
        : "Continue";
    optionsContainer.replaceChildren();

    item.options.forEach((option, index) => {
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "answer";
        input.id = `answer-${index}`;
        input.value = option;
        input.addEventListener("change", () => {
            answerButton.disabled = false;
        });

        const label = document.createElement("label");
        label.className = "option";
        label.htmlFor = input.id;
        label.append(input, document.createTextNode(option));
        optionsContainer.append(label);
    });
}

function renderResults() {
    const results = document.querySelector("#results");
    const scoreDisplay = document.querySelector("#score");
    let score = 0;
    results.replaceChildren();

    roundQuestions.forEach((item, index) => {
        const wasCorrect = guesses[index] === item.answer;
        if (wasCorrect) score += 1;

        const result = document.createElement("article");
        result.className = "result";
        const heading = document.createElement("h3");
        heading.textContent = `${index + 1}. ${item.question}`;
        const verdict = document.createElement("p");
        verdict.className = "badge";
        verdict.textContent = wasCorrect ? "Your guess was right." : "Your guess was not correct.";
        const answer = document.createElement("p");
        answer.textContent = `Correct answer: ${item.answer}`;
        const explanation = document.createElement("p");
        explanation.textContent = item.explanation;
        const citation = document.createElement("p");
        citation.append(document.createTextNode("Source: "));
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        citation.append(link);
        result.append(heading, verdict, answer, explanation, citation);
        results.append(result);
    });

    scoreDisplay.textContent = `Final score: ${score} out of ${roundQuestions.length}`;
    showOnly(reveal);
}

function unlockAnswers() {
    unlocked = true;
    renderResults();
    if ("vibrate" in navigator) navigator.vibrate(150);
}

function distanceInMeters(latitude, longitude) {
    const earthRadius = 6371000;
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = toRadians(latitude - TARGET_LATITUDE);
    const longitudeDelta = toRadians(longitude - TARGET_LONGITUDE);
    const startLatitude = toRadians(TARGET_LATITUDE);
    const endLatitude = toRadians(latitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function handleLocationSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const distance = distanceInMeters(latitude, longitude);
    accuracyDisplay.textContent = `Reported accuracy: about ${Math.round(accuracy)} meters.`;

    if (distance <= UNLOCK_RADIUS_METERS) {
        consecutiveInRangeReadings += 1;
        if (consecutiveInRangeReadings >= 2) {
            unlockAnswers();
            return;
        }
        locationStatus.textContent = `You're within range. One more in-range reading is needed (${Math.round(distance)} meters from the point). Check again.`;
        return;
    }

    consecutiveInRangeReadings = 0;
    locationStatus.textContent = `Not in range yet (about ${Math.round(distance)} meters away). Move closer and check again.`;
}

function handleLocationError(error) {
    consecutiveInRangeReadings = 0;
    if (error.code === 1) {
        locationStatus.textContent = "Location permission was denied. Allow location access in your browser settings, then try again.";
    } else if (error.code === 2) {
        locationStatus.textContent = "Your device couldn't determine its location. Check that location services are on, then try again.";
    } else if (error.code === 3) {
        locationStatus.textContent = "The location request timed out. Try again when you have a clearer signal.";
    } else {
        locationStatus.textContent = "Your location couldn't be checked. Check your device settings and try again.";
    }
}

document.querySelector("#start-button").addEventListener("click", startRound);
document.querySelector("#again-button").addEventListener("click", startRound);

document.querySelector("#answer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = optionsContainer.querySelector('input[name="answer"]:checked');
    if (!selected) return;

    guesses.push(selected.value);
    currentQuestion += 1;
    if (currentQuestion < roundQuestions.length) {
        renderQuestion();
    } else if (unlocked) {
        renderResults();
    } else {
        locationStatus.textContent = "Your guesses are saved for this round. Check your location when you're ready.";
        showOnly(locked);
    }
});

checkButton.addEventListener("click", () => {
    if (checkingLocation) return;

    // Presenter override: append ?demo=unlock to the page URL and press this button.
    if (new URLSearchParams(window.location.search).get("demo") === "unlock") {
        unlockAnswers();
        return;
    }

    if (!window.isSecureContext) {
        locationStatus.textContent = "Location needs a secure connection. Open this page and try again.";
        return;
    }
    if (!navigator.geolocation) {
        locationStatus.textContent = "This browser doesn't support location checks.";
        return;
    }

    checkingLocation = true;
    checkButton.disabled = true;
    checkButton.textContent = "Checking location…";
    locationStatus.textContent = "Checking for your device's location…";

    const finishCheck = () => {
        checkingLocation = false;
        checkButton.disabled = false;
        checkButton.textContent = "Check my location";
    };
    navigator.geolocation.getCurrentPosition(
        (position) => {
            handleLocationSuccess(position);
            finishCheck();
        },
        (error) => {
            handleLocationError(error);
            finishCheck();
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
});
