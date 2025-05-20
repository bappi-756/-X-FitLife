document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('xfitUser'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }

    // Update profile information
    const profileImage = document.getElementById('profileImage');
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');

    // Set profile image
    if (userData.profileImage) {
        profileImage.innerHTML = `<img src="${userData.profileImage}" alt="${userData.username}">`;
    }

    // Set name and other values
    profileName.textContent = `${userData.username}, ${getAge(userData.createdAt)}`;
    profileUsername.textContent = userData.username;
    profileEmail.textContent = userData.email;
    
    // Add click event for email field to show message
    profileEmail.addEventListener('click', function(e) {
        e.preventDefault();
        showEmailChangeMessage();
    });
    
    // Function to show email change message
    function showEmailChangeMessage() {
        // Check if message already exists
        if (document.querySelector('.email-change-message')) {
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'email-change-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <i class="fas fa-info-circle"></i>
                <p>You can't change your email directly. Please contact the X-fit team and they can change this for you.</p>
                <button class="close-message"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        document.body.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 10);
        
        // Add event listener to close button
        messageElement.querySelector('.close-message').addEventListener('click', function() {
            messageElement.classList.remove('visible');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (messageElement.classList.contains('visible')) {
                messageElement.classList.remove('visible');
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Handle image upload
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = event.target.result;
                profileImage.innerHTML = `<img src="${imageData}" alt="${userData.username}">`;
                
                // Update localStorage
                userData.profileImage = imageData;
                localStorage.setItem('xfitUser', JSON.stringify(userData));
            };
            reader.readAsDataURL(file);
        }
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    
    // Check if theme is stored in localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Light and dark theme option clicks
    document.getElementById('lightTheme').addEventListener('click', function() {
        themeToggle.checked = false;
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    });
    
    document.getElementById('darkTheme').addEventListener('click', function() {
        themeToggle.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    });

    // Function to make content editable
    function makeEditable(element, type) {
        const parent = element.closest('.detail-item');
        parent.classList.add('editing');
        element.contentEditable = true;
        element.focus();

        // Save previous value
        const previousValue = element.textContent;

        // Function to save changes
        function saveChanges() {
            const newValue = element.textContent.trim();
            if (newValue !== previousValue) {
                if (type === 'username' && !isValidUsername(newValue)) {
                    alert('Username can only contain letters, numbers, underscore (_) and hyphen (-)');
                    element.textContent = previousValue;
                } else if (type === 'email' && !isValidEmail(newValue)) {
                    alert('Please enter a valid email address');
                    element.textContent = previousValue;
                } else {
                    // Update userData and localStorage
                    userData[type] = newValue;
                    localStorage.setItem('xfitUser', JSON.stringify(userData));

                    // Update all relevant displays
                    if (type === 'username') {
                        profileName.textContent = `${newValue}, ${getAge(userData.createdAt)}`;
                    }
                }
            }
            
            // Reset editing state
            element.contentEditable = false;
            parent.classList.remove('editing');
        }

        // Save on enter key
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveChanges();
            }
            if (e.key === 'Escape') {
                element.textContent = previousValue;
                element.contentEditable = false;
                parent.classList.remove('editing');
            }
        });

        // Save on blur
        element.addEventListener('blur', saveChanges);
    }

    // Add click handlers for edit buttons
    document.getElementById('editProfileUsername').addEventListener('click', function() {
        makeEditable(profileUsername, 'username');
    });

    document.getElementById('editProfileEmail').addEventListener('click', function() {
        makeEditable(profileEmail, 'email');
    });

    // Animate progress ring
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        circle.style.animation = 'progress 1s ease-out forwards';
    }

    // Personality Test Variables
    const personalityQuestionBtn = document.getElementById('personalityQuestionBtn');
    const personalityTestPopup = document.getElementById('personalityTestPopup');
    const closePersonalityPopup = document.getElementById('closePersonalityPopup');
    const questionText = document.getElementById('questionText');
    const currentQuestionEl = document.getElementById('currentQuestion');
    const progressBar = document.getElementById('testProgressBar');
    const resultContainer = document.getElementById('resultContainer');
    const questionContainer = document.querySelector('.question-container');
    const personalityType = document.getElementById('personalityType');
    const personalityDescription = document.getElementById('personalityDescription');
    const restartTestBtn = document.getElementById('restartTestBtn');
    const answerBtns = document.querySelectorAll('.answer-btn');
    
    console.log('Debug: Personality elements loaded:', {
        personalityQuestionBtn,
        personalityTestPopup,
        closePersonalityPopup
    });
    
    let currentQuestion = 0;
    let score = 0;
    
    // Questions for the test (introvert-extrovert spectrum)
    const questions = [
        "I enjoy being the center of attention.",
        "I prefer one-on-one conversations to group activities.",
        "I feel energized after spending time with a lot of people.",
        "I need time alone to recharge after social situations.",
        "I tend to think before I speak.",
        "I enjoy meeting new people and making new friends easily.",
        "I prefer to work alone rather than in a team.",
        "I'm usually the one who initiates conversations.",
        "I find it draining to be in social situations for long periods.",
        "I get my energy from being around other people."
    ];
    
    // Questions 0, 2, 5, 7, 9 are extrovert indicators (higher score = more extroverted)
    // Questions 1, 3, 4, 6, 8 are introvert indicators (higher score = more introverted)
    const extrovertQuestions = [0, 2, 5, 7, 9];
    
    // Open personality test popup
    personalityQuestionBtn.addEventListener('click', function(e) {
        console.log('Debug: Personality button clicked');
        e.preventDefault();
        personalityTestPopup.style.display = 'flex';
        personalityTestPopup.classList.add('active');
        startTest();
    });
    
    // Ensure the button click is working by adding a direct click event to the button
    if (personalityQuestionBtn) {
        personalityQuestionBtn.onclick = function(e) {
            console.log('Debug: Personality button clicked via onclick');
            e.preventDefault();
            personalityTestPopup.style.display = 'flex';
            personalityTestPopup.classList.add('active');
            startTest();
        };
    } else {
        console.error('Debug: personalityQuestionBtn not found in DOM');
    }
    
    // Close personality test popup
    if (closePersonalityPopup) {
        closePersonalityPopup.addEventListener('click', function() {
            console.log('Debug: Close button clicked');
            personalityTestPopup.classList.remove('active');
            personalityTestPopup.style.display = 'none';
            resetTest();
        });
    } else {
        console.error('Debug: closePersonalityPopup not found in DOM');
    }
    
    // Restart test button
    restartTestBtn.addEventListener('click', function() {
        resultContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        resetTest();
    });
    
    // Add event listeners to all answer buttons
    answerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const scoreValue = parseInt(this.getAttribute('data-score'));
            
            // Calculate score based on question type
            if (extrovertQuestions.includes(currentQuestion)) {
                score += scoreValue; // For extrovert questions, higher score is more extroverted
            } else {
                score += (6 - scoreValue); // For introvert questions, invert the score
            }
            
            // Move to next question or show result
            currentQuestion++;
            if (currentQuestion < questions.length) {
                updateQuestion();
            } else {
                showResult();
            }
        });
    });
    
    // Start the test
    function startTest() {
        resetTest();
        questionContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        updateQuestion();
    }
    
    // Update the question display
    function updateQuestion() {
        questionText.textContent = questions[currentQuestion];
        currentQuestionEl.textContent = currentQuestion + 1;
        
        // Update progress bar
        const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Highlight the buttons
        answerBtns.forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Show the test result
    function showResult() {
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Calculate whether the user is an introvert or extrovert
        // Maximum possible score: 5 points per question * 10 questions = 50
        // Midpoint = 25
        const maxScore = questions.length * 5;
        const scorePercentage = (score / maxScore) * 100;
        
        let result, description;
        if (scorePercentage >= 70) {
            result = "Extrovert";
            description = "You are a strong extrovert! You get your energy from being around other people and enjoy social activities. You're outgoing, talkative, and comfortable in group settings. You think out loud and enjoy being the center of attention.";
        } else if (scorePercentage >= 55) {
            result = "Mild Extrovert";
            description = "You lean towards extroversion. You generally enjoy social activities and being around people, though you may sometimes need alone time to recharge. You're comfortable in groups but also value meaningful one-on-one connections.";
        } else if (scorePercentage >= 45) {
            result = "Ambivert";
            description = "You are an ambivert, with a good balance of both introverted and extroverted traits. You can adapt to various social situations and enjoy both social time and alone time. You have the best of both worlds!";
        } else if (scorePercentage >= 30) {
            result = "Mild Introvert";
            description = "You lean towards introversion. You enjoy meaningful conversations and close relationships, but large groups or prolonged social interaction may drain your energy. You value your alone time and use it to recharge.";
        } else {
            result = "Introvert";
            description = "You are a strong introvert! You gain energy from solitude and quiet reflection. You prefer deep one-on-one conversations to large group settings. You think before you speak and value meaningful connections over casual acquaintances.";
        }
        
        personalityType.textContent = result;
        personalityDescription.textContent = description;
        
        // Save result to user data if available
        if (userData) {
            userData.personalityType = result;
            localStorage.setItem('xfitUser', JSON.stringify(userData));
        }
    }
    
    // Reset the test
    function resetTest() {
        currentQuestion = 0;
        score = 0;
        progressBar.style.width = '10%';
    }
});

// Helper function to validate username
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username);
}

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to calculate age from createdAt
function getAge(createdAt) {
    const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
}

// Initialize personality test independently to ensure it works
document.addEventListener('DOMContentLoaded', function() {
    const personalityBtn = document.getElementById('personalityQuestionBtn');
    const popup = document.getElementById('personalityTestPopup');

    if (personalityBtn && popup) {
        console.log('Initializing personality test independently');
        
        // Force the button to be clickable
        personalityBtn.style.pointerEvents = 'auto';
        personalityBtn.style.cursor = 'pointer';
        
        personalityBtn.addEventListener('click', function(e) {
            console.log('Personality button clicked (direct)');
            e.preventDefault();
            e.stopPropagation();
            popup.style.display = 'flex';
            popup.classList.add('active');
        });
    }
}); 