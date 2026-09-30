// ---------- Helpers ----------
function setLoading(el, message) {
    el.innerHTML = `<span class="loading">${message}</span>`;
}

function setError(el, message) {
    el.innerHTML = `<span class="error-text">❌ ${escapeHtml(message)}</span>`;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
}

// ---------- Q&A ----------
const qaForm = document.getElementById("qaForm");
const qaResult = document.getElementById("qaResult");

qaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = document.getElementById("question").value.trim();
    if (!question) return;

    setLoading(qaResult, "Thinking...");
    try {
        const res = await fetch(`/qa?question=${encodeURIComponent(question)}`);
        const data = await res.json();
        if (data.error) {
            setError(qaResult, data.error);
        } else {
            qaResult.innerHTML = `<h3>Answer:</h3><div>${escapeHtml(data.answer)}</div>`;
        }
    } catch (err) {
        setError(qaResult, "Something went wrong. Please try again.");
    }
});

// ---------- Explanation ----------
const explainForm = document.getElementById("explainForm");
const explanationResult = document.getElementById("explanationResult");

explainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topic = document.getElementById("topic").value.trim();
    if (!topic) return;

    setLoading(explanationResult, "Generating explanation...");
    try {
        const res = await fetch("/explain/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
        });
        const data = await res.json();
        if (data.error) {
            setError(explanationResult, data.error);
        } else {
            explanationResult.innerHTML = `<h3>Explanation:</h3><div>${escapeHtml(data.explanation)}</div>`;
        }
    } catch (err) {
        setError(explanationResult, "Something went wrong. Please try again.");
    }
});

// ---------- Summary ----------
const summaryForm = document.getElementById("summaryForm");
const summaryResult = document.getElementById("summaryResult");

summaryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("summaryText").value.trim();
    if (!text) return;

    setLoading(summaryResult, "Summarizing...");
    try {
        const res = await fetch("/summarize/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (data.error) {
            setError(summaryResult, data.error);
        } else {
            summaryResult.innerHTML = `<h3>Summary:</h3><div>${escapeHtml(data.summary)}</div>`;
        }
    } catch (err) {
        setError(summaryResult, "Something went wrong. Please try again.");
    }
});

// ---------- Quiz ----------
const quizForm = document.getElementById("quizForm");
const quizResult = document.getElementById("quizResult");

quizForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("quizText").value.trim();
    if (!text) return;

    setLoading(quizResult, "Generating quiz...");
    try {
        const res = await fetch("/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        const data = await res.json();
        renderQuiz(data.quiz);
    } catch (err) {
        setError(quizResult, "Something went wrong. Please try again.");
    }
});

function renderQuiz(quiz) {
    if (!Array.isArray(quiz) || quiz.length === 0 || quiz[0].error) {
        setError(quizResult, (quiz && quiz[0] && quiz[0].error) || "Could not generate a quiz.");
        return;
    }

    let html = "<h3>Quiz:</h3>";
    quiz.forEach((q, i) => {
        html += `<div class="quiz-question" data-answer="${escapeHtml(q.answer)}">`;
        html += `<p><strong>Q${i + 1}:</strong> ${escapeHtml(q.question)}</p>`;
        html += `<div class="quiz-options">`;
        q.options.forEach((opt, j) => {
            html += `
                <label>
                    <input type="radio" name="q${i}" value="${escapeHtml(opt)}">
                    ${escapeHtml(opt)}
                </label>`;
        });
        html += `</div>`;
        html += `<button type="button" class="check-btn" onclick="checkAnswer(${i})">Check Answer</button>`;
        html += `<div class="feedback" id="feedback-${i}"></div>`;
        html += `</div>`;
    });

    quizResult.innerHTML = html;
}

function checkAnswer(index) {
    const questionDiv = document.querySelectorAll(".quiz-question")[index];
    const correctAnswer = questionDiv.getAttribute("data-answer");
    const selected = questionDiv.querySelector(`input[name="q${index}"]:checked`);
    const feedback = document.getElementById(`feedback-${index}`);

    if (!selected) {
        feedback.className = "feedback incorrect";
        feedback.innerText = "Please select an option first.";
        return;
    }

    if (selected.value === correctAnswer) {
        feedback.className = "feedback correct";
        feedback.innerText = "✅ Correct!";
    } else {
        feedback.className = "feedback incorrect";
        feedback.innerText = `❌ Incorrect. Correct answer: ${correctAnswer}`;
    }
}

// ---------- Learning Path ----------
const learnForm = document.getElementById("learnForm");
const learnResult = document.getElementById("learnResult");

learnForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topic = document.getElementById("learnTopic").value.trim();
    if (!topic) return;

    setLoading(learnResult, "Building your learning path...");
    try {
        const res = await fetch(`/learn/recommendations?topic=${encodeURIComponent(topic)}`);
        const data = await res.json();
        learnResult.innerHTML = `<h3>Learning Recommendations for "${escapeHtml(data.topic)}":</h3><div>${escapeHtml(data.recommendation)}</div>`;
    } catch (err) {
        setError(learnResult, "Something went wrong. Please try again.");
    }
});