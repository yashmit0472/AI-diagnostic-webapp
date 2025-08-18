// Global variables
let selectedSymptoms = [];
const API_BASE_URL = 'http://localhost:5001';

// DOM elements
const symptomInput = document.getElementById('symptom-input');
const selectedSymptomsContainer = document.getElementById('selected-symptoms');
const resultsSection = document.getElementById('results-section');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    console.log('AI Medical Diagnostic Assistant initialized');
    updateSelectedSymptoms();
    checkAPIHealth();
}

function setupEventListeners() {
    // Enter key for symptom input
    symptomInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addSymptom();
        }
    });
    
    // Auto-suggest functionality (basic implementation)
    symptomInput.addEventListener('input', function(e) {
        // Could implement symptom suggestions here
    });
}

async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('API Health:', data);
        }
    } catch (error) {
        console.warn('API not available:', error);
        showNotification('Backend API is not available. Please start the backend server.', 'warning');
    }
}

function addSymptom() {
    const input = symptomInput.value.trim().toLowerCase();
    if (!input) return;
    
    // Split input by common separators
    const symptoms = input.split(/[,\\s]+/).filter(s => s.length > 1);
    
    symptoms.forEach(symptom => {
        if (symptom && !selectedSymptoms.includes(symptom)) {
            selectedSymptoms.push(symptom);
        }
    });
    
    symptomInput.value = '';
    updateSelectedSymptoms();
}

function addQuickSymptom(symptom) {
    if (!selectedSymptoms.includes(symptom)) {
        selectedSymptoms.push(symptom);
        updateSelectedSymptoms();
    }
}

function removeSymptom(symptom) {
    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    updateSelectedSymptoms();
}

function updateSelectedSymptoms() {
    if (selectedSymptoms.length === 0) {
        selectedSymptomsContainer.innerHTML = `
            <div style="text-align: center; color: #a0aec0; font-style: italic; padding: 1rem;">
                Selected symptoms will appear here
            </div>
        `;
        return;
    }
    
    selectedSymptomsContainer.innerHTML = selectedSymptoms.map(symptom => `
        <div class="symptom-tag">
            <span>${symptom}</span>
            <button class="remove-btn" onclick="removeSymptom('${symptom}')" title="Remove symptom">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

async function analyzeSymptoms() {
    if (selectedSymptoms.length === 0) {
        showNotification('Please add at least one symptom', 'error');
        return;
    }
    
    const age = parseInt(document.getElementById('age').value) || 25;
    const weight = parseFloat(document.getElementById('weight').value) || 70;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symptoms: selectedSymptoms,
                age: age,
                weight: weight
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayResults(data);
            scrollToResults();
        } else {
            throw new Error(data.error || 'Prediction failed');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification(`Analysis failed: ${error.message}`, 'error');
        
        // Show demo results if API is not available
        if (error.message.includes('fetch')) {
            showDemoResults();
        }
    } finally {
        showLoading(false);
    }
}

function displayResults(data) {
    const resultsContent = document.getElementById('results-content');
    const recommendation = data.recommendation;
    
    resultsContent.innerHTML = `
        <!-- Primary Result -->
        <div class="primary-result">
            <h3>Primary Prediction</h3>
            <div class="disease-name">${data.primary_prediction.disease}</div>
            <div class="confidence">${data.primary_prediction.confidence.toFixed(1)}% Confidence</div>
        </div>
        
        <!-- Matched Symptoms -->
        <div class="matched-symptoms">
            <h4>Matched Symptoms (${data.total_symptoms_matched})</h4>
            <div class="matched-symptoms-list">
                ${data.matched_symptoms.map(symptom => 
                    `<div class="matched-symptom">${symptom}</div>`
                ).join('')}
            </div>
        </div>
        
        <!-- Top Predictions -->
        <div class="top-predictions">
            <h4>All Predictions</h4>
            ${data.top_predictions.map(pred => `
                <div class="prediction-item">
                    <span class="prediction-name">${pred.disease}</span>
                    <span class="prediction-confidence">${pred.confidence.toFixed(1)}%</span>
                </div>
            `).join('')}
        </div>
        
        <!-- Recommendation -->
        <div class="recommendation ${recommendation.level.replace('_', '-')}">
            <h4>
                Medical Recommendation
                <span class="urgency ${recommendation.urgency}">${recommendation.urgency.toUpperCase()}</span>
            </h4>
            <p>${recommendation.message}</p>
            
            ${recommendation.next_steps ? `
                <div class="next-steps">
                    <strong>Recommended Next Steps:</strong>
                    <ul>
                        ${recommendation.next_steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${recommendation.disclaimer ? `
                <div style="margin-top: 1rem; font-size: 0.9rem; font-style: italic; opacity: 0.8;">
                    <strong>Disclaimer:</strong> ${recommendation.disclaimer}
                </div>
            ` : ''}
        </div>
        
        <!-- Patient Info -->
        <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
            <small><strong>Patient Information:</strong> Age: ${data.patient_info.age}, Weight: ${data.patient_info.weight}kg | Analysis Date: ${new Date(data.timestamp).toLocaleString()}</small>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button class="category-btn" onclick="exportResults()" style="flex: 1;">
                <i class="fas fa-download"></i> Export Results
            </button>
            <button class="category-btn" onclick="clearResults()" style="flex: 1;">
                <i class="fas fa-refresh"></i> New Analysis
            </button>
        </div>
    `;
    
    resultsSection.style.display = 'block';
}

function showDemoResults() {
    // Show demo results when API is not available
    const demoData = {
        primary_prediction: {
            disease: "Common Cold",
            confidence: 75.5
        },
        top_predictions: [
            { disease: "Common Cold", confidence: 75.5 },
            { disease: "Flu", confidence: 68.2 },
            { disease: "Viral Infection", confidence: 45.1 }
        ],
        matched_symptoms: selectedSymptoms,
        total_symptoms_matched: selectedSymptoms.length,
        recommendation: {
            level: "moderate_confidence",
            urgency: "medium",
            message: "Moderate confidence prediction suggests Common Cold. This is a demo result as the API is not available.",
            next_steps: [
                "Rest and stay hydrated",
                "Monitor symptoms",
                "Consult healthcare provider if symptoms worsen"
            ]
        },
        patient_info: {
            age: document.getElementById('age').value,
            weight: document.getElementById('weight').value
        },
        timestamp: new Date().toISOString()
    };
    
    displayResults(demoData);
    scrollToResults();
    showNotification('Showing demo results - Please start the backend server for real predictions', 'info');
}

function scrollToResults() {
    resultsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function clearResults() {
    selectedSymptoms = [];
    updateSelectedSymptoms();
    resultsSection.style.display = 'none';
    document.getElementById('age').value = 25;
    document.getElementById('weight').value = 70;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportResults() {
    const resultsContent = document.getElementById('results-content');
    if (!resultsContent) return;
    
    // Create a simple text export
    const exportText = `
AI Medical Diagnostic Results
============================

Primary Prediction: ${document.querySelector('.disease-name')?.textContent || 'N/A'}
Confidence: ${document.querySelector('.confidence')?.textContent || 'N/A'}

Symptoms Analyzed: ${selectedSymptoms.join(', ')}

Generated on: ${new Date().toLocaleString()}

Disclaimer: This is an AI prediction and should not replace professional medical diagnosis.
`;
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-diagnosis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Results exported successfully', 'success');
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        loadingOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#fed7d7' : type === 'success' ? '#c6f6d5' : type === 'warning' ? '#ffd89b' : '#bee3f8'};
            color: ${type === 'error' ? '#c53030' : type === 'success' ? '#276749' : type === 'warning' ? '#d69e2e' : '#2b6cb0'};
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        ">
            <strong>${type.toUpperCase()}:</strong> ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
