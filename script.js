// Close the Popup
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Toggle Dark/Light Mode
function toggleMode() {
    document.body.classList.toggle("light-mode");
}

// Calculation Logic
function calculate() {
    const densityWater = parseFloat(document.getElementById("density-water").value);
    const densitySediment = parseFloat(document.getElementById("density-sediment").value);
    const diameter = parseFloat(document.getElementById("diameter").value);
    const shearVelocity = parseFloat(document.getElementById("shear-velocity").value);
    const criticalTheta = parseFloat(document.getElementById("critical-theta").value);

    const gravity = 9.81;
    const tau0 = densityWater * Math.pow(shearVelocity, 2);
    const theta = tau0 / (gravity * (densitySediment - densityWater) * diameter);

    // Update Overview Tab
    document.getElementById("theta-result").textContent = theta.toFixed(6);
    document.getElementById("critical-theta-result").textContent = criticalTheta.toFixed(6);
    document.getElementById("result").textContent = theta > criticalTheta
        ? `Erosion occurs! θ = ${theta.toFixed(6)} > θₐ = ${criticalTheta}`
        : `No erosion. θ = ${theta.toFixed(6)} ≤ θₐ = ${criticalTheta}`;
    document.getElementById("result").style.color = theta > criticalTheta ? "red" : "green";

    // Update Chart
    displayChart(theta, criticalTheta);

    // Update AI Recommendation
    generateRecommendation(theta, criticalTheta);

    // Update Details Tab
    updateParameterTable(densityWater, densitySediment, diameter, shearVelocity, theta);
}

// Tab Switching Logic
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// AI Recommendation Logic
function generateRecommendation(theta, criticalTheta) {
    const recommendationElement = document.getElementById("ai-recommendation");
    if (theta > criticalTheta) {
        recommendationElement.textContent = "Increase sediment stability by reducing flow velocity or using protective structures.";
    } else {
        recommendationElement.textContent = "Current conditions are stable. No immediate action required.";
    }
}

// Update Parameter Table
function updateParameterTable(densityWater, densitySediment, diameter, shearVelocity, theta) {
    document.getElementById("water-density").textContent = densityWater.toFixed(2);
    document.getElementById("sediment-density").textContent = densitySediment.toFixed(2);
    document.getElementById("sediment-diameter").textContent = diameter.toFixed(6);
    document.getElementById("shear-velocity-result").textContent = shearVelocity.toFixed(2);
    document.getElementById("theta-table-result").textContent = theta.toFixed(6);
}

// Chart Display Logic
let chartInstance;
let chartType = "bar";

function updateChartType() {
    chartType = document.getElementById("chart-type").value;
    const theta = parseFloat(document.getElementById("theta-result").textContent) || 0;
    const criticalTheta = parseFloat(document.getElementById("critical-theta-result").textContent) || 0;
    displayChart(theta, criticalTheta);
}

function displayChart(theta, criticalTheta) {
    const ctx = document.getElementById("result-chart").getContext("2d");
    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: ["θ (Shield Parameter)", "θₐ (Critical)"],
            datasets: [{
                label: "Values",
                data: [theta, criticalTheta],
                backgroundColor: ["#3498db", "#e74c3c"]
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(18);
    pdf.text("Shield Parameter Calculator - Results", 10, 10);

    // Overview Results
    pdf.setFontSize(14);
    pdf.text("Overview:", 10, 30);
    pdf.text(`Shield Parameter (θ): ${document.getElementById("theta-result").textContent}`, 10, 40);
    pdf.text(`Critical Parameter (θₐ): ${document.getElementById("critical-theta-result").textContent}`, 10, 50);
    pdf.text(`Status: ${document.getElementById("result").textContent}`, 10, 60);

    // Recommendation
    pdf.text("AI Recommendation:", 10, 80);
    pdf.text(document.getElementById("ai-recommendation").textContent, 10, 90);

    // Save PDF
    pdf.save("Shield_Parameter_Results.pdf");
}

// Reset Form
function resetForm() {
    document.getElementById("shield-form").reset();
    document.getElementById("theta-result").textContent = "-";
    document.getElementById("critical-theta-result").textContent = "-";
    document.getElementById("result").textContent = "-";
    document.getElementById("result").style.color = "white";
    document.getElementById("ai-recommendation").textContent = "-";

    if (chartInstance) {
        chartInstance.destroy();
    }
}

// Comparison Logic
let comparisonData = [];

function addComparison() {
    const densityWater = parseFloat(document.getElementById("density-water").value);
    const densitySediment = parseFloat(document.getElementById("density-sediment").value);
    const diameter = parseFloat(document.getElementById("diameter").value);
    const shearVelocity = parseFloat(document.getElementById("shear-velocity").value);
    const criticalTheta = parseFloat(document.getElementById("critical-theta").value);

    const gravity = 9.81;
    const tau0 = densityWater * Math.pow(shearVelocity, 2);
    const theta = tau0 / (gravity * (densitySediment - densityWater) * diameter);

    comparisonData.push({
        densityWater,
        densitySediment,
        diameter,
        shearVelocity,
        criticalTheta,
        theta
    });

    displayComparison();
}

function displayComparison() {
    const container = document.getElementById("comparison-results");
    container.innerHTML = "<h3>Comparison Results</h3>";
    comparisonData.forEach((data, index) => {
        container.innerHTML += `
            <div class="comparison-item">
                <h4>Comparison ${index + 1}</h4>
                <p>Shield Parameter (θ): ${data.theta.toFixed(6)}</p>
                <p>Critical Parameter (θₐ): ${data.criticalTheta.toFixed(6)}</p>
                <p>Status: ${data.theta > data.criticalTheta ? "Erosion occurs" : "No erosion"}</p>
            </div>
        `;
    });
}
