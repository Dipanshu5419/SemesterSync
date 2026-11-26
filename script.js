
const subjects = {
    web: { total: 20, bar: ".web-progress" },
    programming: { total: 17, bar: ".programming-progress" },
    ai: { total: 24, bar: ".ai-progress" },
    calculus: { total: 20, bar: ".calculus-progress" },
    electrical: { total: 5, bar: ".electrical-progress" }
};

const storageKey = "backlogZeroProgress";

let progress = JSON.parse(localStorage.getItem(storageKey)) || {};


function updateProgress() {
    let completedTotal = 0;
    let topicTotal = 0;

    for (const [subject, info] of Object.entries(subjects)) {
        const checkboxes = document.querySelectorAll(
            `.tracker-subject[data-subject="${subject}"] input[type="checkbox"]`
        );

        if (checkboxes.length > 0) {
            progress[subject] = Array.from(checkboxes).map(
                box => box.checked
            );
        }

        const completed = (progress[subject] || []).filter(Boolean).length;

        completedTotal += completed;
        topicTotal += info.total;

        const percentage = Math.round((completed / info.total) * 100);
        const bar = document.querySelector(info.bar);

        if (bar) {
            bar.style.width = percentage + "%";

            const card = bar.closest(".subject-card");
            const label = card?.querySelector("span");

            if (label) {
                label.textContent = percentage + "% Completed";
            }
        }
    }

    localStorage.setItem(storageKey, JSON.stringify(progress));

    const statCards = document.querySelectorAll(".stat-card");

    const values = [
        5,
        completedTotal,
        topicTotal - completedTotal
    ];

    

    values.forEach((value, index) => {
        const number = statCards[index]?.querySelector(".stat-number");

        if (number) {
            number.textContent = value;
        }
    });

    const overallPercentage = Math.round(
        (completedTotal / topicTotal) * 100
    );

    updateProgressRing(overallPercentage);
}

// CHAPTER TRACKER - RESTORE AND SAVE CHECKBOXES

document.querySelectorAll(
    '.tracker-subject input[type="checkbox"]'
).forEach(box => {
    const subject = box.closest(".tracker-subject").dataset.subject;

    const checkboxes = Array.from(
        document.querySelectorAll(
            `.tracker-subject[data-subject="${subject}"] input[type="checkbox"]`
        )
    );

    const savedStates = progress[subject];

    if (savedStates) {
        const index = checkboxes.indexOf(box);
        box.checked = savedStates[index] ?? false;
    }

    box.addEventListener("change", updateProgress);
});

updateProgress();
// PLANNER CHECKBOX SAVING
(function () {
    const tasks = document.querySelectorAll(
        ".task-item input[type='checkbox']"
    );

    if (tasks.length === 0) return;

    const storageKey = "backlogZeroPlannerTasks";

    const savedTasks = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
    );

    tasks.forEach((task, index) => {
        task.checked = savedTasks[index] ?? false;

        task.addEventListener("change", () => {
            const currentTasks = Array.from(tasks).map(
                checkbox => checkbox.checked
            );

            localStorage.setItem(
                storageKey,
                JSON.stringify(currentTasks)
            );
        });
    });
})();

// NOTES SEARCH
const notesSearch = document.getElementById("notesSearch");

if (notesSearch) {
    notesSearch.addEventListener("input", function () {
        const searchText = this.value.toLowerCase();

        document.querySelectorAll(".note-card").forEach(card => {
            const cardText = card.textContent.toLowerCase();

            card.style.display = cardText.includes(searchText)
                ? ""
                : "none";
        });
    });
}

/* =================================
   SEMESTER SYNC - ANIMATION SCRIPT
================================= */

// 1. ANIMATED DASHBOARD COUNTERS

function animateCounters() {
    document.querySelectorAll(".stat-number").forEach(element => {
        if (element.dataset.animated === "true") return;

        const finalText = element.textContent.trim();
        const finalNumber = parseFloat(finalText);

        if (isNaN(finalNumber)) return;

        const suffix = finalText.includes("%") ? "%" : "";
        const duration = 900;
        const startTime = performance.now();

        element.dataset.animated = "true";

        function updateCounter(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(finalNumber * eased);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

animateCounters();


// 2. UPDATE CIRCULAR PROGRESS RING


function updateProgressRing(percentage) {
    const ring = document.querySelector(".ring-fill");
    const ringText = document.querySelector(".ring-text");

    if (!ring || !ringText) return;

    const circumference = 283;
    const offset = circumference - (percentage / 100) * circumference;

    ring.style.strokeDashoffset = offset;
    ringText.textContent = percentage + "%";
}



/* CURSOR GLOW EFFECT */

(function () {
    if (
        window.matchMedia("(hover: none)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    let mouseX = -500;
    let mouseY = -500;
    let glowX = -500;
    let glowY = -500;

    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        glow.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => {
        glow.style.opacity = "0";
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;

        glow.style.left = glowX + "px";
        glow.style.top = glowY + "px";

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
})();



/* SEMESTER SYNC - THEME SWITCHER */

(function () {
    const savedTheme = localStorage.getItem("backlogZeroTheme") || "current";

    function applyTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("backlogZeroTheme", theme);

        document.querySelectorAll(".theme-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.theme === theme
            );
        });
    }

    // Apply saved theme immediately
    applyTheme(savedTheme);

    // Theme button clicks
    document.querySelectorAll(".theme-btn").forEach(button => {
        button.addEventListener("click", () => {
            applyTheme(button.dataset.theme);
        });
    });
})();


/* CHAPTER TRACKER - ACCORDION BEHAVIOUR */

document.querySelectorAll(".tracker-subject").forEach(subject => {
    const modules = subject.querySelectorAll("details");

    modules.forEach(module => {
        module.addEventListener("toggle", () => {
            if (module.open) {
                modules.forEach(otherModule => {
                    if (otherModule !== module) {
                        otherModule.open = false;
                    }
                });
            }
        });
    });
});


/* SUBJECT-WISE COMPLETION COUNTS */

document.querySelectorAll(".tracker-subject").forEach(subject => {
    const heading = subject.querySelector("h3");
    const checkboxes = subject.querySelectorAll('input[type="checkbox"]');

    if (!heading || checkboxes.length === 0) return;

    const count = document.createElement("span");
    count.className = "subject-completion-count";
    heading.appendChild(count);

    function updateCount() {
        const completed = [...checkboxes].filter(box => box.checked).length;
        count.textContent = `${completed}/${checkboxes.length} completed`;
    }

    checkboxes.forEach(box => {
        box.addEventListener("change", updateCount);
    });

    updateCount();
});
