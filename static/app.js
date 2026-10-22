const form = document.querySelector("#coach-form");
const results = document.querySelector("#results");
const resultsContent = document.querySelector("#results-content");
const resultsTitle = document.querySelector("#results-title");
const submitButton = document.querySelector("#submit-button");
const errorMessage = document.querySelector("#form-error");

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const text = (value) => value ? escapeHtml(value) : '<span class="empty">Not provided</span>';
const list = (items) => items?.length ? `<ul class="list">${items.map(item => `<li>${text(item)}</li>`).join("")}</ul>` : '<p class="empty">None provided.</p>';
const link = (resource) => resource?.url ? `<a class="resource" href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer">${text(resource.name)}<small>${text(resource.purpose)}</small></a>` : "";

function renderOverview(overview) {
  const assessment = overview.candidate_assessment || {};
  const priorities = overview.priority_distribution || [];
  return `<article class="card span-12">
    <div class="card-heading"><div><p class="eyebrow">Overview</p><h3>${text(overview.target_role)}</h3></div><span class="badge">${text(overview.total_estimated_hours)} hrs total</span></div>
    <div class="stat-grid"><div class="stat"><strong>${text(overview.total_estimated_hours)}</strong><span>estimated hours</span></div><div class="stat"><strong>${priorities.length}</strong><span>priority areas</span></div><div class="stat"><strong>${text(overview.target_role)}</strong><span>target role</span></div></div>
    <p class="body-copy">${text(overview.overall_strategy)}</p>
    <div class="split-list"><div><p class="subheading">Strengths</p>${list(assessment.current_strengths)}<p class="subheading">Knowledge gaps</p>${list(assessment.knowledge_gaps)}</div><div><p class="subheading">Missing steps</p>${list(assessment.missing_preparation_steps)}<p class="subheading">Deprioritize</p>${list(assessment.redundant_or_low_value_activities)}</div></div>
    <div class="split-list" style="margin-top:24px"><div><p class="subheading">Priority distribution</p>${priorities.map(item => `<div class="priority-row"><span>${text(item.category)}</span><div class="bar"><i style="width:${Number(item.percentage) || 0}%"></i></div><em>${text(item.percentage)}%</em></div>`).join("")}</div><div><p class="subheading">Assumptions</p>${list(overview.assumptions)}</div></div>
  </article>`;
}

function renderTopics(topics) {
  return `<article class="card span-12"><div class="card-heading"><div><p class="eyebrow">Priorities</p><h3>What to work on first</h3></div><span class="step">TOPICS</span></div><div class="results-grid">${(topics || []).map(topic => `<div class="card topic-card span-4"><div class="card-heading"><span class="rank">${text(topic.topic_id)} · #${text(topic.priority_rank)}</span><span class="badge ${topic.priority === "critical" ? "critical" : ""}">${text(topic.priority)}</span></div><h3>${text(topic.topic)}</h3><div class="meta-line"><span>${text(topic.estimated_total_hours)} hrs</span><span>Current: ${text(topic.current_level)}</span></div><p><strong>Impact:</strong> ${text(topic.expected_impact)}</p><p><strong>Target:</strong> ${text(topic.target_level)}</p><p><strong>Why now:</strong> ${text(topic.reason_for_priority)}</p><p><strong>Prerequisites:</strong> ${topic.prerequisites?.length ? text(topic.prerequisites.join(", ")) : "None"}</p></div>`).join("")}</div></article>`;
}

function renderPhases(phases) {
  return `<article class="card span-12"><div class="card-heading"><div><p class="eyebrow">Execution plan</p><h3>Preparation phases</h3></div></div>${(phases || []).map((phase, index) => `<details class="phase" ${index === 0 ? "open" : ""}><summary><div><h3>${text(phase.phase_name)}</h3><span class="meta-line">${text(phase.estimated_hours)} hours · ${(phase.topics_covered || []).map(text).join(", ")}</span></div></summary><div class="phase-content"><p class="body-copy">${text(phase.objective)}</p>${(phase.tasks || []).map(task => `<div class="task"><h4>${text(task.task_name)}</h4><div class="task-columns"><div><p class="subheading">Study</p>${list(task.what_to_study)}<p class="subheading">Practice</p>${list(task.practice_activities)}</div><div><p class="subheading">Completion criteria</p>${list(task.completion_criteria)}<p class="subheading">Resources</p>${(task.recommended_resources || []).map(link).join("") || '<p class="empty">No resources listed.</p>'}</div></div><div class="task-footer"><span>${text(task.estimated_minutes)} minutes</span><span><strong>Why:</strong> ${text(task.reason)}</span></div></div>`).join("")}<p class="subheading" style="margin-top:20px">Phase completion</p>${list(phase.phase_completion_criteria)}</div></details>`).join("")}</article>`;
}

function renderSchedule(schedule) {
  return `<article class="card span-8"><div class="card-heading"><div><p class="eyebrow">Calendar</p><h3>Daily schedule</h3></div><span class="badge">${text(schedule.total_days)} days · ${text(schedule.hours_per_day)} hrs/day</span></div><div class="schedule">${(schedule.daily_plan || []).map(day => `<div class="day"><div class="day-label">Day ${text(day.day)}</div><div><h4>${text(day.focus)}</h4><p>${text(day.expected_outcome)}</p>${list(day.tasks)}<div class="meta-line">${text(day.estimated_hours)} estimated hours · ${(day.topic_ids || []).map(text).join(", ")}</div></div></div>`).join("")}</div><p class="callout" style="margin:22px 0 0"><strong>Adjustment strategy:</strong> ${text(schedule.adjustment_strategy)}</p></article>`;
}

function renderBenchmarks(benchmarks) {
  return `<article class="card span-4"><div class="card-heading"><div><p class="eyebrow">Measure progress</p><h3>Readiness benchmarks</h3></div></div>${(benchmarks || []).map(item => `<div class="benchmark"><h4>${text(item.benchmark)} <span class="badge ${item.importance === "critical" ? "critical" : ""}">${text(item.importance)}</span></h4><p><span class="label">Measure:</span> ${text(item.measurement_method)}</p><p><span class="label">Target:</span> ${text(item.target_threshold)}</p><p><span class="label">If missed:</span> ${text(item.remediation_if_unmet)}</p></div>`).join("")}</article>`;
}

function renderCalloutGroup(title, items) {
  return `<div class="callout"><h4>${escapeHtml(title)}</h4>${list(items)}</div>`;
}

function renderFinalSections(data) {
  const execution = data.interview_execution || {};
  const recommendations = data.final_recommendations || {};
  return `<article class="card span-6"><div class="card-heading"><div><p class="eyebrow">Interview day</p><h3>Execution checklist</h3></div></div>${renderCalloutGroup("Technical approach", execution.technical_interview_approach)}${renderCalloutGroup("Behavioral preparation", execution.behavioral_preparation)}${renderCalloutGroup("Projects and resume", execution.project_and_resume_preparation)}${renderCalloutGroup("Common mistakes", execution.common_mistakes_to_avoid)}</article><article class="card span-6"><div class="card-heading"><div><p class="eyebrow">Final review</p><h3>Recommendations</h3></div></div>${renderCalloutGroup("Highest-impact actions", recommendations.highest_impact_actions)}${renderCalloutGroup("Deprioritize", recommendations.activities_to_deprioritize)}${renderCalloutGroup("Review strategy", recommendations.final_review_strategy)}<div class="callout"><h4>Readiness assessment</h4><p class="body-copy">${text(recommendations.readiness_assessment)}</p></div></article>`;
}

function renderResults(data) {
  resultsTitle.textContent = data.roadmap_overview?.target_role || "Preparation plan";
  resultsContent.innerHTML = `<div class="results-grid">${renderOverview(data.roadmap_overview || {})}${renderTopics(data.topic_priorities)}${renderPhases(data.preparation_phases)}${renderSchedule(data.schedule || {})}${renderBenchmarks(data.readiness_benchmarks)}${renderFinalSections(data)}</div>`;
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="loading">Generating roadmap</span>';

  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to generate the roadmap.");
    renderResults(data);
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<span>Generate roadmap</span><span class="button-arrow">→</span>';
  }
});

document.querySelector("#new-plan").addEventListener("click", () => {
  results.hidden = true;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
