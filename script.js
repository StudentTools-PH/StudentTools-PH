/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://neezresdveggzazolmui.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_vwZTomJ0M9DUWa9gRYMhDw_fyV8ygKL";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


let currentUser = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

  initializeDarkMode();
  initializeWallpaper();
  initializeSearch();

  const {
    data
  } = await supabaseClient.auth.getSession();

  currentUser =
    data.session
      ? data.session.user
      : null;

  updateAccountUI();

  if (currentUser) {
    await loadHistory();
  }

});


supabaseClient.auth.onAuthStateChange(
  async function (event, session) {

    currentUser =
      session
        ? session.user
        : null;

    updateAccountUI();

    if (currentUser) {
      await loadHistory();
    } else {
      showLoggedOutHistory();
    }

  }
);


/* =========================================================
   DARK MODE
========================================================= */

function initializeDarkMode() {

  const saved =
    localStorage.getItem("studenttools_dark");

  const button =
    document.getElementById("darkModeBtn");

  if (saved === "true") {

    document.body.classList.add("dark");

    button.textContent = "☀️";

  }

}


document
  .getElementById("darkModeBtn")
  .addEventListener("click", function () {

    document.body.classList.toggle("dark");

    const dark =
      document.body.classList.contains("dark");

    localStorage.setItem(
      "studenttools_dark",
      dark
    );

    this.textContent =
      dark ? "☀️" : "🌙";

  });


/* =========================================================
   WALLPAPER
========================================================= */

const wallpaperButton =
  document.getElementById("wallpaperBtn");

const wallpaperMenu =
  document.getElementById("wallpaperMenu");


wallpaperButton.addEventListener(
  "click",
  function (event) {

    event.stopPropagation();

    wallpaperMenu.classList.toggle("hidden");

  }
);


document.addEventListener(
  "click",
  function (event) {

    if (
      !wallpaperMenu.contains(event.target) &&
      event.target !== wallpaperButton
    ) {

      wallpaperMenu.classList.add("hidden");

    }

  }
);


function setWallpaper(type) {

  const wallpapers = {

    default:
      "",

    ocean:
      "linear-gradient(135deg, rgba(219,234,254,.82), rgba(147,197,253,.72))",

    purple:
      "linear-gradient(135deg, rgba(237,233,254,.82), rgba(196,181,253,.72))",

    sunset:
      "linear-gradient(135deg, rgba(254,215,170,.82), rgba(253,186,116,.72))",

    mint:
      "linear-gradient(135deg, rgba(209,250,229,.82), rgba(167,243,208,.72))"

  };

  document.body.style.backgroundImage =
    wallpapers[type];

  localStorage.setItem(
    "studenttools_wallpaper",
    type
  );

  localStorage.removeItem(
    "studenttools_custom_wallpaper"
  );

  wallpaperMenu.classList.add("hidden");

}


function initializeWallpaper() {

  const custom =
    localStorage.getItem(
      "studenttools_custom_wallpaper"
    );

  if (custom) {

    document.body.style.backgroundImage =
      `url("${custom}")`;

    return;

  }

  const saved =
    localStorage.getItem(
      "studenttools_wallpaper"
    );

  if (saved) {

    setWallpaper(saved);

  }

}


document
  .getElementById("wallpaperUpload")
  .addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please choose an image.");
        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        function () {

          document.body.style.backgroundImage =
            `url("${reader.result}")`;

          localStorage.setItem(
            "studenttools_custom_wallpaper",
            reader.result
          );

          localStorage.removeItem(
            "studenttools_wallpaper"
          );

          wallpaperMenu.classList.add("hidden");

        };

      reader.readAsDataURL(file);

    }
  );


function removeCustomWallpaper() {

  localStorage.removeItem(
    "studenttools_custom_wallpaper"
  );

  localStorage.removeItem(
    "studenttools_wallpaper"
  );

  document.body.style.backgroundImage = "";

  wallpaperMenu.classList.add("hidden");

}


/* =========================================================
   ACCOUNT MODAL
========================================================= */

document
  .getElementById("accountBtn")
  .addEventListener(
    "click",
    openAccountModal
  );


function openAccountModal() {

  document
    .getElementById("accountModal")
    .classList.remove("hidden");

  if (currentUser) {

    showLoggedIn();

  } else {

    showLogin();

  }

}


function closeAccountModal() {

  document
    .getElementById("accountModal")
    .classList.add("hidden");

}


function showLogin() {

  document
    .getElementById("loginPanel")
    .classList.remove("hidden");

  document
    .getElementById("registerPanel")
    .classList.add("hidden");

  document
    .getElementById("loggedInPanel")
    .classList.add("hidden");

}


function showRegister() {

  document
    .getElementById("loginPanel")
    .classList.add("hidden");

  document
    .getElementById("registerPanel")
    .classList.remove("hidden");

  document
    .getElementById("loggedInPanel")
    .classList.add("hidden");

}


function showLoggedIn() {

  document
    .getElementById("loginPanel")
    .classList.add("hidden");

  document
    .getElementById("registerPanel")
    .classList.add("hidden");

  document
    .getElementById("loggedInPanel")
    .classList.remove("hidden");

  document
    .getElementById("accountEmail")
    .textContent =
    currentUser.email;

}


/* =========================================================
   REGISTER
========================================================= */

async function registerUser() {

  const email =
    document
      .getElementById("registerEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("registerPassword")
      .value;

  const password2 =
    document
      .getElementById("registerPassword2")
      .value;

  const message =
    document
      .getElementById("registerMessage");


  message.textContent = "";


  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;

  }


  if (password.length < 6) {

    message.textContent =
      "Password must be at least 6 characters.";

    return;

  }


  if (password !== password2) {

    message.textContent =
      "Passwords do not match.";

    return;

  }


  message.textContent =
    "Creating account...";


  const {
    data,
    error
  } =
    await supabaseClient.auth.signUp({

      email,
      password,

      options: {

        emailRedirectTo:
          window.location.origin +
          window.location.pathname

      }

    });


  if (error) {

    message.textContent =
      error.message;

    return;

  }


  if (data.session) {

    message.textContent =
      "Account created successfully!";

    closeAccountModal();

  } else {

    message.textContent =
      "Account created. Check your email to confirm your account, then log in.";

  }

}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser() {

  const email =
    document
      .getElementById("loginEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      .value;

  const message =
    document
      .getElementById("loginMessage");


  if (!email || !password) {

    message.textContent =
      "Please enter your email and password.";

    return;

  }


  message.textContent =
    "Logging in...";


  const {
    error
  } =
    await supabaseClient.auth.signInWithPassword({

      email,
      password

    });


  if (error) {

    message.textContent =
      error.message;

    return;

  }


  message.textContent =
    "Login successful.";

  closeAccountModal();

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

  const {
    error
  } =
    await supabaseClient.auth.signOut();

  if (error) {

    alert(error.message);

    return;

  }

  closeAccountModal();

}


/* =========================================================
   PASSWORD RESET
========================================================= */

async function resetPassword() {

  const email =
    document
      .getElementById("loginEmail")
      .value
      .trim();

  const message =
    document
      .getElementById("loginMessage");


  if (!email) {

    message.textContent =
      "Enter your email first.";

    return;

  }


  const {
    error
  } =
    await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          window.location.origin +
          window.location.pathname
      }
    );


  if (error) {

    message.textContent =
      error.message;

    return;

  }


  message.textContent =
    "Password reset email sent.";

}


/* =========================================================
   ACCOUNT UI
========================================================= */

function updateAccountUI() {

  const button =
    document.getElementById("accountBtn");

  const historyLogin =
    document.getElementById(
      "historyLoginMessage"
    );

  const historyContent =
    document.getElementById(
      "historyContent"
    );


  if (currentUser) {

    button.textContent =
      "👤 Account";

    historyLogin.classList.add("hidden");

    historyContent.classList.remove("hidden");

  } else {

    button.textContent =
      "👤 Login";

    historyLogin.classList.remove("hidden");

    historyContent.classList.add("hidden");

  }

}


/* =========================================================
   CALCULATOR NAVIGATION
========================================================= */

function openCalculator(type) {

  const area =
    document.getElementById(
      "calculatorArea"
    );


  area.classList.remove("hidden");


  document
    .querySelectorAll(".calculator-content")
    .forEach(function (calculator) {

      calculator.classList.add("hidden");

    });


  const calculator =
    document.getElementById(
      type + "Calculator"
    );


  if (calculator) {

    calculator.classList.remove("hidden");

  }


  area.scrollIntoView({
    behavior: "smooth"
  });

}


function closeCalculator() {

  document
    .getElementById("calculatorArea")
    .classList.add("hidden");

  document
    .getElementById("calculators")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* =========================================================
   CALCULATOR SEARCH
========================================================= */

const calculatorSearchData = [

  {
    name: "Final Grade Calculator",
    keywords: "final grade grade marks scores",
    type: "grade"
  },

  {
    name: "GPA Calculator",
    keywords: "gpa average grades subjects",
    type: "gpa"
  },

  {
    name: "Tuition Calculator",
    keywords: "tuition school fees expenses money",
    type: "tuition"
  },

  {
    name: "Study Hours Calculator",
    keywords: "study time hours schedule",
    type: "study"
  },

  {
    name: "Scientific Calculator",
    keywords: "scientific math calculator sin cos tan logarithm",
    type: "scientific"
  }

];


function initializeSearch() {

  const input =
    document.getElementById(
      "calculatorSearch"
    );

  const results =
    document.getElementById(
      "searchResults"
    );


  input.addEventListener(
    "input",
    function () {

      const query =
        input.value
          .trim()
          .toLowerCase();


      results.innerHTML = "";


      if (!query) {

        return;

      }


      const matches =
        calculatorSearchData.filter(
          function (item) {

            return (
              item.name
                .toLowerCase()
                .includes(query) ||

              item.keywords
                .includes(query)
            );

          }
        );


      matches.forEach(
        function (item) {

          const div =
            document.createElement("div");

          div.className =
            "search-result";

          div.textContent =
            item.name;

          div.addEventListener(
            "click",
            function () {

              input.value = "";

              results.innerHTML = "";

              openCalculator(item.type);

            }
          );

          results.appendChild(div);

        }
      );

    }
  );

}


/* =========================================================
   FINAL GRADE
========================================================= */

function calculateAdvancedGrade() {

  const categories = [

    {
      name: "Homework",
      grade: "homeworkGrade",
      weight: "homeworkWeight"
    },

    {
      name: "Written Works",
      grade: "writtenGrade",
      weight: "writtenWeight"
    },

    {
      name: "Quizzes",
      grade: "quizGrade",
      weight: "quizWeight"
    },

    {
      name: "Projects",
      grade: "projectGrade",
      weight: "projectWeight"
    },

    {
      name: "Participation",
      grade: "participationGrade",
      weight: "participationWeight"
    },

    {
      name: "Sports Credit",
      grade: "sportsGrade",
      weight: "sportsWeight"
    }

  ];


  let weightedPoints = 0;
  let usedWeight = 0;


  const historyParts = [];


  for (const category of categories) {

    const gradeInput =
      document.getElementById(
        category.grade
      );

    const weightInput =
      document.getElementById(
        category.weight
      );


    const gradeText =
      gradeInput.value.trim();

    const weightText =
      weightInput.value.trim();


    if (
      gradeText === "" &&
      weightText === ""
    ) {

      continue;

    }


    if (
      gradeText === "" ||
      weightText === ""
    ) {

      showGradeMessage(
        category.name +
        " needs both a grade and a weight."
      );

      return;

    }


    const grade =
      Number(gradeText);

    const weight =
      Number(weightText);


    if (
      !Number.isFinite(grade) ||
      !Number.isFinite(weight) ||
      grade < 0 ||
      grade > 100 ||
      weight < 0 ||
      weight > 100
    ) {

      showGradeMessage(
        "Please enter valid values for " +
        category.name + "."
      );

      return;

    }


    weightedPoints +=
      grade * (weight / 100);

    usedWeight +=
      weight;


    historyParts.push(
      `${category.name}: ${grade}% × ${weight}%`
    );

  }


  const finalExamGradeText =
    document
      .getElementById("finalExamGrade")
      .value
      .trim();

  const finalExamWeightText =
    document
      .getElementById("finalExamWeight")
      .value
      .trim();


  let examGrade = null;
  let examWeight = 0;


  if (
    finalExamGradeText !== "" ||
    finalExamWeightText !== ""
  ) {

    if (
      finalExamGradeText === "" ||
      finalExamWeightText === ""
    ) {

      showGradeMessage(
        "Final Exam needs both a grade and a weight."
      );

      return;

    }


    examGrade =
      Number(finalExamGradeText);

    examWeight =
      Number(finalExamWeightText);


    if (
      !Number.isFinite(examGrade) ||
      !Number.isFinite(examWeight) ||
      examGrade < 0 ||
      examGrade > 100 ||
      examWeight < 0 ||
      examWeight > 100
    ) {

      showGradeMessage(
        "Please enter valid final exam values."
      );

      return;

    }


    historyParts.push(
      `Final Exam: ${examGrade}% × ${examWeight}%`
    );

  }


  const extraCreditInput =
    document.getElementById("extraCredit");

  let extraCredit = 0;


  if (
    extraCreditInput.value.trim() !== ""
  ) {

    extraCredit =
      Number(extraCreditInput.value);


    if (
      !Number.isFinite(extraCredit) ||
      extraCredit < 0 ||
      extraCredit > 100
    ) {

      showGradeMessage(
        "Please enter a valid extra credit value."
      );

      return;

    }


    historyParts.push(
      `Extra Credit: +${extraCredit}`
    );

  }


  const totalWeight =
    usedWeight + examWeight;


  if (totalWeight === 0) {

    showGradeMessage(
      "Enter at least one grade and weight."
    );

    return;

  }


  let currentWeightedGrade = 0;


  if (usedWeight > 0) {

    currentWeightedGrade =
      weightedPoints /
      (usedWeight / 100);

  }


  let finalGrade;


  if (examGrade !== null) {

    finalGrade =
      weightedPoints +
      examGrade * (examWeight / 100);

  } else {

    finalGrade =
      weightedPoints;

  }


  finalGrade += extraCredit;


  document
    .getElementById("currentWeightedAnswer")
    .textContent =
    formatPercent(currentWeightedGrade);


  document
    .getElementById("finalGradeAnswer")
    .textContent =
    formatPercent(finalGrade);


  document
    .getElementById("totalWeightAnswer")
    .textContent =
    totalWeight.toFixed(1) + "%";


  const message =
    document.getElementById(
      "gradeMessage"
    );


  if (totalWeight < 100) {

    message.textContent =
      "⚠️ You have entered only " +
      totalWeight.toFixed(1) +
      "% of the grading weight.";

  } else if (totalWeight > 100) {

    message.textContent =
      "⚠️ Your grading weights exceed 100%.";

  } else {

    message.textContent =
      "✓ Your grading weights total 100%.";

  }


  saveHistory(
    "Final Grade",
    historyParts.join(" | "),
    formatPercent(finalGrade)
  );

}


function showGradeMessage(message) {

  document
    .getElementById("gradeMessage")
    .textContent =
    "⚠️ " + message;

}


function formatPercent(number) {

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return number.toFixed(2) + "%";

}


/* =========================================================
   GPA
========================================================= */

function addSubject() {

  const container =
    document.getElementById("subjects");


  const count =
    container.querySelectorAll(
      ".gpa-subject-row"
    ).length;


  if (count >= 30) {

    alert(
      "You can add up to 30 subjects."
    );

    return;

  }


  const row =
    document.createElement("div");

  row.className =
    "gpa-subject-row";


  row.innerHTML = `

    <input
      type="text"
      class="subject-name"
      placeholder="Subject name"
    >

    <input
      type="number"
      class="subject-grade"
      placeholder="Grade"
      min="0"
      max="100"
      step="0.01"
    >

    <button
      class="remove-subject"
      onclick="removeSubject(this)"
      type="button"
    >
      ×
    </button>

  `;


  container.appendChild(row);

}


function removeSubject(button) {

  const container =
    document.getElementById("subjects");

  const rows =
    container.querySelectorAll(
      ".gpa-subject-row"
    );


  if (rows.length <= 1) {

    rows[0]
      .querySelector(".subject-name")
      .value = "";

    rows[0]
      .querySelector(".subject-grade")
      .value = "";

    return;

  }


  button
    .closest(".gpa-subject-row")
    .remove();

}


function calculateGPA() {

  const rows =
    document.querySelectorAll(
      ".gpa-subject-row"
    );


  let total = 0;
  let count = 0;

  const historyParts = [];


  for (const row of rows) {

    const name =
      row
        .querySelector(".subject-name")
        .value
        .trim();

    const gradeText =
      row
        .querySelector(".subject-grade")
        .value
        .trim();


    if (
      name === "" &&
      gradeText === ""
    ) {

      continue;

    }


    if (gradeText === "") {

      alert(
        "Please enter a grade."
      );

      return;

    }


    const grade =
      Number(gradeText);


    if (
      !Number.isFinite(grade) ||
      grade < 0 ||
      grade > 100
    ) {

      alert(
        "Grades must be between 0 and 100."
      );

      return;

    }


    total += grade;

    count++;


    historyParts.push(
      `${name || "Subject"}: ${grade}`
    );

  }


  if (count === 0) {

    document
      .getElementById("gpaAnswer")
      .textContent =
      "N/A";

    return;

  }


  const average =
    total / count;


  document
    .getElementById("gpaAnswer")
    .textContent =
    average.toFixed(2);


  saveHistory(
    "GPA",
    historyParts.join(" | "),
    average.toFixed(2)
  );

}


/* =========================================================
   TUITION
========================================================= */

function getNumber(id) {

  const value =
    Number(
      document
        .getElementById(id)
        .value
    );


  if (
    !Number.isFinite(value) ||
    value < 0
  ) {

    return 0;

  }


  return value;

}


function calculateTuition() {

  const tuition =
    getNumber("tuition");

  const schoolFees =
    getNumber("schoolFees");

  const books =
    getNumber("books");

  const transportation =
    getNumber("transportation");

  const food =
    getNumber("food");

  const housing =
    getNumber("housing");

  const otherExpenses =
    getNumber("otherExpenses");


  let semesters =
    Number(
      document
        .getElementById("semestersPerYear")
        .value
    );


  if (
    !Number.isFinite(semesters) ||
    semesters < 1
  ) {

    semesters = 2;

  }


  semesters =
    Math.min(4, semesters);


  const semesterTotal =
    tuition +
    schoolFees +
    books +
    transportation +
    food +
    housing +
    otherExpenses;


  const monthlyTotal =
    semesterTotal / 4;


  const yearlyTotal =
    semesterTotal * semesters;


  document
    .getElementById("semesterAnswer")
    .textContent =
    formatPeso(semesterTotal);


  document
    .getElementById("monthlyTuitionAnswer")
    .textContent =
    formatPeso(monthlyTotal);


  document
    .getElementById("yearlyTuitionAnswer")
    .textContent =
    formatPeso(yearlyTotal);


  saveHistory(
    "Tuition",
    `Semester expenses: ${formatPeso(semesterTotal)}`,
    `Yearly: ${formatPeso(yearlyTotal)}`
  );

}


function formatPeso(amount) {

  return "₱" +
    amount.toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    );

}


/* =========================================================
   STUDY HOURS
========================================================= */

function calculateStudy() {

  const subjects =
    Number(
      document
        .getElementById("studySubjects")
        .value
    );

  const hoursPerSubject =
    Number(
      document
        .getElementById("hoursPerSubject")
        .value
    );

  const studyDays =
    Number(
      document
        .getElementById("studyDays")
        .value
    );

  const miscHours =
    Number(
      document
        .getElementById("miscHours")
        .value
    );


  if (
    !Number.isFinite(subjects) ||
    !Number.isFinite(hoursPerSubject) ||
    !Number.isFinite(studyDays) ||
    !Number.isFinite(miscHours) ||

    subjects < 1 ||
    subjects > 50 ||

    hoursPerSubject < 0 ||
    hoursPerSubject > 168 ||

    studyDays < 1 ||
    studyDays > 7 ||

    miscHours < 0 ||
    miscHours > 24
  ) {

    alert(
      "Please enter valid study schedule values."
    );

    return;

  }


  const weeklyStudy =
    subjects *
    hoursPerSubject;


  const dailyStudy =
    weeklyStudy /
    studyDays;


  const monthlyStudy =
    weeklyStudy *
    4.345;


  const weeklyMisc =
    miscHours * 7;


  const monthlyMisc =
    miscHours * 30.4375;


  const averageDailyStudy =
    weeklyStudy / 7;


  const freeTime =
    24 -
    averageDailyStudy -
    miscHours;


  document
    .getElementById("dailyStudyAnswer")
    .textContent =
    formatHours(dailyStudy);


  document
    .getElementById("weeklyStudyAnswer")
    .textContent =
    formatHours(weeklyStudy);


  document
    .getElementById("monthlyStudyAnswer")
    .textContent =
    formatHours(monthlyStudy);


  document
    .getElementById("dailyMiscAnswer")
    .textContent =
    formatHours(miscHours);


  document
    .getElementById("weeklyMiscAnswer")
    .textContent =
    formatHours(weeklyMisc);


  document
    .getElementById("monthlyMiscAnswer")
    .textContent =
    formatHours(monthlyMisc);


  document
    .getElementById("scheduleStudy")
    .textContent =
    formatHours(averageDailyStudy);


  document
    .getElementById("scheduleMisc")
    .textContent =
    formatHours(miscHours);


  const freeTimeElement =
    document.getElementById(
      "freeTimeAnswer"
    );

  const warning =
    document.getElementById(
      "studyWarning"
    );


  if (freeTime < 0) {

    freeTimeElement.textContent =
      "Over " +
      formatHours(
        Math.abs(freeTime)
      );

    warning.textContent =
      "⚠️ Your study and miscellaneous activities exceed 24 hours per day on average.";

  } else {

    freeTimeElement.textContent =
      formatHours(freeTime);

    warning.textContent = "";

  }


  saveHistory(
    "Study Hours",
    `${subjects} subjects × ${hoursPerSubject} hours/week`,
    `${formatHours(weeklyStudy)} per week`
  );

}


function formatHours(hours) {

  if (!Number.isFinite(hours)) {
    return "N/A";
  }

  const rounded =
    Math.round(hours * 10) / 10;

  return rounded + " hours";

}


/* =========================================================
   SCIENTIFIC CALCULATOR
========================================================= */

let scientificExpression = "";

let angleMode = "DEG";


function updateScientificDisplay() {

  document
    .getElementById(
      "scientificExpression"
    )
    .textContent =
    scientificExpression || "0";

}


function scientificInput(value) {

  scientificExpression += value;

  updateScientificDisplay();

}


function scientificClear() {

  scientificExpression = "";

  document
    .getElementById(
      "scientificExpression"
    )
    .textContent = "0";

  document
    .getElementById(
      "scientificResult"
    )
    .textContent = "0";

}


function scientificDelete() {

  scientificExpression =
    scientificExpression.slice(0, -1);

  updateScientificDisplay();

}


function scientificFunction(name) {

  if (name === "factorial") {

    scientificExpression += "!";

  } else {

    scientificExpression +=
      name + "(";

  }

  updateScientificDisplay();

}


function setAngleMode(mode) {

  angleMode = mode;


  document
    .getElementById("degreeButton")
    .classList.toggle(
      "angle-active",
      mode === "DEG"
    );


  document
    .getElementById("radianButton")
    .classList.toggle(
      "angle-active",
      mode === "RAD"
    );

}


function factorial(n) {

  if (
    !Number.isFinite(n) ||
    n < 0 ||
    Math.floor(n) !== n
  ) {

    throw new Error(
      "Factorial requires a non-negative whole number."
    );

  }


  if (n > 170) {

    throw new Error(
      "Number too large."
    );

  }


  let result = 1;


  for (
    let i = 2;
    i <= n;
    i++
  ) {

    result *= i;

  }


  return result;

}


function scientificCalculate() {

  if (!scientificExpression) {
    return;
  }


  try {

    let expression =
      scientificExpression;


    expression =
      expression
        .replaceAll("π", "Math.PI")
        .replace(/\be\b/g, "Math.E")
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("^", "**");


    expression =
      expression.replace(
        /sqrt\(/g,
        "Math.sqrt("
      );


    expression =
      expression.replace(
        /log\(/g,
        "Math.log10("
      );


    expression =
      expression.replace(
        /ln\(/g,
        "Math.log("
      );


    expression =
      expression.replace(
        /factorial\(/g,
        "factorial("
      );


    expression =
      expression.replace(
        /sin\(/g,
        angleMode === "DEG"
          ? "Math.sin((Math.PI/180)*("
          : "Math.sin("
      );


    expression =
      expression.replace(
        /cos\(/g,
        angleMode === "DEG"
          ? "Math.cos((Math.PI/180)*("
          : "Math.cos("
      );


    expression =
      expression.replace(
        /tan\(/g,
        angleMode === "DEG"
          ? "Math.tan((Math.PI/180)*("
          : "Math.tan("
      );


    expression =
      expression.replace(
        /asin\(/g,
        angleMode === "DEG"
          ? "(180/Math.PI)*Math.asin("
          : "Math.asin("
      );


    expression =
      expression.replace(
        /acos\(/g,
        angleMode === "DEG"
          ? "(180/Math.PI)*Math.acos("
          : "Math.acos("
      );


    expression =
      expression.replace(
        /atan\(/g,
        angleMode === "DEG"
          ? "(180/Math.PI)*Math.atan("
          : "Math.atan("
      );


    expression =
      expression.replace(
        /(\d+(?:\.\d+)?)!/g,
        "factorial($1)"
      );


    expression =
      expression.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
      );


    /*
      Only permit calculator characters/functions.
      This prevents arbitrary JavaScript from being entered.
    */

    const allowed =
      /^[0-9+\-*/().,\sA-Za-z_]+$/;


    if (!allowed.test(expression)) {

      throw new Error(
        "Invalid expression."
      );

    }


    const result =
      Function(
        "factorial",
        `"use strict"; return (${expression})`
      )(factorial);


    if (
      typeof result !== "number" ||
      !Number.isFinite(result)
    ) {

      throw new Error(
        "Invalid result."
      );

    }


    const formatted =
      Number(
        result.toPrecision(12)
      ).toString();


    document
      .getElementById(
        "scientificResult"
      )
      .textContent =
      formatted;


    saveHistory(
      "Scientific Calculator",
      scientificExpression,
      formatted
    );


  } catch (error) {

    document
      .getElementById(
        "scientificResult"
      )
      .textContent =
      "Error";

  }

}


/* =========================================================
   HISTORY
========================================================= */

async function saveHistory(
  calculator,
  calculation,
  result
) {

  if (!currentUser) {

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("calculation_history")
      .insert({

        user_id:
          currentUser.id,

        calculator:
          calculator,

        calculation:
          calculation,

        result:
          result

      });


  if (error) {

    console.error(
      "History save error:",
      error
    );

    return;

  }


  await loadHistory();

}


async function loadHistory() {

  if (!currentUser) {

    showLoggedOutHistory();

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("calculation_history")
      .select("*")
      .eq(
        "user_id",
        currentUser.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(100);


  if (error) {

    console.error(
      "History loading error:",
      error
    );

    return;

  }


  document
    .getElementById(
      "historyAccountLabel"
    )
    .textContent =
    "Logged in as " +
    currentUser.email;


  renderHistory(data || []);

}


function renderHistory(history) {

  const list =
    document.getElementById(
      "historyList"
    );


  list.innerHTML = "";


  if (history.length === 0) {

    list.innerHTML = `

      <div class="history-item">

        <strong>
          No calculations yet.
        </strong>

        <p>
          Your saved calculations will appear here.
        </p>

      </div>

    `;

    return;

  }


  history.forEach(
    function (item) {

      const div =
        document.createElement("div");

      div.className =
        "history-item";


      const date =
        new Date(
          item.created_at
        ).toLocaleString();


      div.innerHTML = `

        <div class="history-item-top">

          <div>

            <div class="history-calculator">
              ${escapeHtml(item.calculator)}
            </div>

            <div class="history-date">
              ${escapeHtml(date)}
            </div>

          </div>

          <button
            class="delete-history"
            onclick="deleteHistoryItem(${item.id})"
            type="button"
          >
            Delete
          </button>

        </div>

        <div class="history-calculation">
          ${escapeHtml(item.calculation)}
        </div>

        <div class="history-result">
          = ${escapeHtml(item.result)}
        </div>

      `;


      list.appendChild(div);

    }
  );

}


function showLoggedOutHistory() {

  const loginMessage =
    document.getElementById(
      "historyLoginMessage"
    );

  const content =
    document.getElementById(
      "historyContent"
    );


  loginMessage.classList.remove(
    "hidden"
  );

  content.classList.add(
    "hidden"
  );

}


async function deleteHistoryItem(id) {

  if (!currentUser) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this calculation?"
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("calculation_history")
      .delete()
      .eq(
        "id",
        id
      )
      .eq(
        "user_id",
        currentUser.id
      );


  if (error) {

    alert(
      "Could not delete calculation."
    );

    console.error(error);

    return;

  }


  await loadHistory();

}


async function clearAllHistory() {

  if (!currentUser) {
    return;
  }


  const confirmed =
    confirm(
      "Delete ALL calculation history?"
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("calculation_history")
      .delete()
      .eq(
        "user_id",
        currentUser.id
      );


  if (error) {

    alert(
      "Could not clear history."
    );

    console.error(error);

    return;

  }


  await loadHistory();

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
