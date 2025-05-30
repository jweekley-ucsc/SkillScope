// ~/Documents/SkillScope/scripts/interviewer.js

document.addEventListener("DOMContentLoaded", () => {
  const rubricNameInput = document.getElementById("rubricName");
  const rubricTextArea = document.getElementById("rubricInput");
  const submitRubricBtn = document.getElementById("submitRubricBtn");
  const rubricSelect = document.getElementById("rubricSelect");
  const rubricPreview = document.getElementById("rubricPreview");

  // Submit rubric via POST
  submitRubricBtn.addEventListener("click", async () => {
    const rubricName = rubricNameInput.value.trim();
    const rubricText = rubricTextArea.value.trim();

    if (!rubricName || !rubricText) {
      alert("Please enter both a rubric name and its content.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5050/submit-rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubric_name: rubricName,
          rubric_csv: rubricText
        })
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("Rubric submitted successfully.");
        fetchRubrics(); // Refresh dropdown
        rubricNameInput.value = "";
        rubricTextArea.value = "";
      } else {
        alert("Error submitting rubric: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting rubric:", err);
      alert("Failed to submit rubric.");
    }
  });

  // Populate dropdown with rubrics
  async function fetchRubrics() {
    try {
      const response = await fetch("http://127.0.0.1:5050/rubrics");
      const rubrics = await response.json();

      rubricSelect.innerHTML = "";
      rubrics.forEach((rubric) => {
        const option = document.createElement("option");
        option.value = rubric.id;
        option.textContent = rubric.name;
        rubricSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load rubrics:", err);
    }
  }

  // Show selected rubric content in preview
  rubricSelect.addEventListener("change", async () => {
    const selectedId = rubricSelect.value;
    if (!selectedId) return;

    try {
      const response = await fetch("http://127.0.0.1:5050/rubrics");
      const rubrics = await response.json();
      const selected = rubrics.find((r) => r.id === selectedId);

      rubricPreview.textContent = selected ? selected.rubric_csv : "";
    } catch (err) {
      console.error("Failed to fetch selected rubric:", err);
    }
  });

  fetchRubrics(); // Initial population of dropdown
});
