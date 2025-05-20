document.addEventListener('DOMContentLoaded', function() {
    // Apply theme from localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Check if user exists in localStorage
    const user = JSON.parse(localStorage.getItem('xfitUser'));
    
    // Load BMI data to homepage card if it exists
    const bmiPreview = document.getElementById('bmiPreview');
    if (bmiPreview && user && user.bmiHistory && user.bmiHistory.length > 0) {
        const latestBmi = user.bmiHistory[user.bmiHistory.length - 1];
        let bmiCategory = '';
        
        const bmiValue = parseFloat(latestBmi.bmi);
        if (bmiValue < 18.5) {
            bmiCategory = "Underweight";
        } else if (bmiValue < 25) {
            bmiCategory = "Normal weight";
        } else if (bmiValue < 30) {
            bmiCategory = "Overweight";
        } else {
            bmiCategory = "Obese";
        }
        
        const date = new Date(latestBmi.date);
        const formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric'
        });
        
        bmiPreview.innerHTML = `<strong>Your BMI:</strong> ${latestBmi.bmi} (${bmiCategory}) <span style="opacity: 0.7; font-size: 0.8rem;">${formattedDate}</span>`;
        
        // Update the BMI card heading based on the BMI value
        const bmiCard = bmiPreview.closest('.card');
        if (bmiCard) {
            const bmiHeading = bmiCard.querySelector('h3');
            if (bmiHeading) {
                if (bmiValue >= 18.5 && bmiValue < 25) {
                    bmiHeading.textContent = "Your BMI is Healthy! 👍";
                } else if (bmiValue < 18.5) {
                    bmiHeading.textContent = "Your BMI is Low";
                } else {
                    bmiHeading.textContent = "Your BMI Needs Attention";
                }
            }
            
            // Update profile circles based on BMI value
            const profileCircles = bmiCard.querySelectorAll('.profile-circle.check');
            if (profileCircles.length === 2) {
                if (bmiValue >= 18.5 && bmiValue < 25) {
                    // Good BMI: Show two check marks
                    profileCircles[0].innerHTML = '<i class="fas fa-check"></i>';
                    profileCircles[1].innerHTML = '<i class="fas fa-check"></i>';
                    profileCircles[0].classList.remove('alert');
                    profileCircles[1].classList.remove('alert');
                } else if (bmiValue >= 25 && bmiValue < 30) {
                    // Slightly high: Show one check and one cross
                    profileCircles[0].innerHTML = '<i class="fas fa-check"></i>';
                    profileCircles[1].innerHTML = '<i class="fas fa-times"></i>';
                    profileCircles[0].classList.remove('alert');
                    profileCircles[1].classList.add('alert');
                } else {
                    // Very low or very high: Show two cross marks
                    profileCircles[0].innerHTML = '<i class="fas fa-times"></i>';
                    profileCircles[1].innerHTML = '<i class="fas fa-times"></i>';
                    profileCircles[0].classList.add('alert');
                    profileCircles[1].classList.add('alert');
                }
            }
        }
    }
    
    // Function to validate username
    function isValidUsername(username) {
        // Only allow letters, numbers, underscore and hyphen
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        return usernameRegex.test(username);
    }
    
    // Function to show validation message
    function showValidationMessage(input, isValid, message) {
        let validationMsg = input.parentElement.querySelector('.validation-message');
        
        if (!validationMsg) {
            validationMsg = document.createElement('div');
            validationMsg.className = 'validation-message';
            input.parentElement.appendChild(validationMsg);
        }
        
        validationMsg.textContent = message;
        validationMsg.style.color = isValid ? '#76c771' : '#ff4444';
        input.style.borderColor = isValid ? '#76c771' : '#ff4444';
    }
    
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
    
    // Update welcome message
    function updateWelcomeMessage(username) {
        const welcomeHeading = document.querySelector('.content h2');
        const hours = new Date().getHours();
        const currentTwoHourBlock = Math.floor(hours / 2); // Changes every 2 hours
        let messageStart = '';
        let messageEnd = '';
        
        // Morning messages
        const morningMessages = [
            ['Good Morning, ', ' ! Rise and shine, its workout time! 💪'],
            ['Morning Champion, ', ' ! Time to energize your day! ⚡'],
            ['Hey Early Bird ', ' ! Ready to crush your morning goals! 🌅'],
            ['Rise and Grind, ', ' ! Your morning success starts now! 🎯']
        ];
        
        // Afternoon messages
        const afternoonMessages = [
            ['Good Afternoon, ', ' ! Keep pushing, keep growing! 🌟'],
            ['Afternoon Warrior ', '! Stay focused, stay strong! 💪'],
            ['Hey there, ', ' ! Time to power through your day! ⚡'],
            ['Afternoon Champion ', ' ! Keep that energy high! 🔥']
        ];
        
        // Evening messages
        const eveningMessages = [
            ['Good Evening, ', ' ! Time to crush those fitness goals! 🏋️‍♂️'],
            ['Hey ', ' ! Stay strong, stay focused. Your journey continues this evening! 💪'],
            ['Good Evening, ', ' ! Every rep takes you closer to greatness. 🚀'],
            ['Evening grind time, ', ' ! Lets push limits today! 🔥'],
            ['Good Evening, ', ' ! Winners train even when the sun goes down. 🌙🏆'],
            ['Hello, ', ' ! A strong evening builds a stronger you. 🛡️'],
            ['Good Evening, ', ' ! Fuel your passion, ignite your power! 🔥💥'],
            ['Hey, ', ' ! Sweat now, shine later. Lets get moving! 🚴‍♂️'],
            ['Good Evening, ', ' ! Small steps = Big results. Lets GO! 🏃‍♂️'],
            ['Hello, ', ' ! Believe. Hustle. Achieve. Your evening workout awaits! 🏆']
        ];
        
        // Night messages
        const nightMessages = [
            ['Rest Well, ', ' ! Your dedication inspires! 🌙✨'],
            ['Sweet Dreams, ', ' ! Recovery is part of the journey! 🌠'],
            ['Late Night, ', ' ! Rest well, tomorrow we conquer! 🌙'],
        ];
        
        // Select message based on time and 2-hour block
        if (hours >= 5 && hours < 12) {
            const index = currentTwoHourBlock % morningMessages.length;
            [messageStart, messageEnd] = morningMessages[index];
        } else if (hours >= 12 && hours < 17) {
            const index = currentTwoHourBlock % afternoonMessages.length;
            [messageStart, messageEnd] = afternoonMessages[index];
        } else if (hours >= 17 && hours < 22) {
            const index = currentTwoHourBlock % eveningMessages.length;
            [messageStart, messageEnd] = eveningMessages[index];
        } else {
            const index = currentTwoHourBlock % nightMessages.length;
            [messageStart, messageEnd] = nightMessages[index];
        }
        
        welcomeHeading.innerHTML = `
            Welcome to X-fitLife<br>
            <span class="greeting">${messageStart}<span class="username">${username}</span>${messageEnd}</span>
        `;
        
        // Update message every 2 hours
        const minutesUntilNextUpdate = (120 - (new Date().getMinutes() + hours * 60) % 120);
        setTimeout(() => {
            updateWelcomeMessage(username);
        }, minutesUntilNextUpdate * 60 * 1000);
    }
    
    // App menu functionality
    const appMenuIcon = document.getElementById('appMenuIcon');
    const appMenuOverlay = document.getElementById('appMenuOverlay');
    const closeAppMenu = document.getElementById('closeAppMenu');
    
    appMenuIcon.addEventListener('click', function() {
        appMenuOverlay.classList.add('visible');
    });
    
    closeAppMenu.addEventListener('click', function() {
        appMenuOverlay.classList.remove('visible');
    });
    
    function loadUserProfile(userData) {
        const userProfileIcon = document.getElementById('userProfileIcon');
        
        // Update profile icon with user image if available
        if (userData.profileImage) {
            userProfileIcon.querySelector('.profile-circle').innerHTML = 
                `<img src="${userData.profileImage}" alt="${userData.username}">`;
        }
        
        // Add click event for user profile
        userProfileIcon.addEventListener('click', function(e) {
            // Check if popup exists
            const existingPopup = document.querySelector('.profile-popup');
            
            if (existingPopup) {
                closeProfilePopup();
            } else {
                const profilePopup = document.createElement('div');
                profilePopup.className = 'profile-popup';
                
                profilePopup.innerHTML = `
                    <div class="popup-content">
                        <div class="popup-header-actions">
                            <a href="settings.html" class="settings-link" title="Go to Settings">
                                <i class="fas fa-cog"></i>
                            </a>
                        </div>
                        <div class="popup-image-container">
                            <div class="popup-image" id="popupImagePreview">
                                ${userData.profileImage ? 
                                  `<img src="${userData.profileImage}" alt="${userData.username}">` : 
                                  `<i class="fas fa-user"></i>`}
                            </div>
                            <label for="popupUserImage" class="edit-image-btn">
                                <i class="fas fa-camera"></i>
                            </label>
                            <input type="file" id="popupUserImage" accept="image/*" style="display:none">
                        </div>
                        
                        <div class="popup-info">
                            <div class="popup-field">
                                <label>Username</label>
                                <input type="text" id="popupUsername" value="${userData.username}">
                            </div>
                            <div class="popup-field">
                                <label>Email</label>
                                <div class="locked-email-field" id="popupEmail">
                                    <span>${userData.email}</span>
                                    <i class="fas fa-lock"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="popup-actions">
                            <button id="saveProfileBtn">Save</button>
                            <button id="closeProfileBtn">Close</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(profilePopup);
                
                // Add click event for email field
                document.getElementById('popupEmail').addEventListener('click', function() {
                    showEmailChangeMessage();
                });
                
                // Image preview update functionality
                const popupImageInput = document.getElementById('popupUserImage');
                const popupImagePreview = document.getElementById('popupImagePreview');
                
                popupImageInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const imageData = event.target.result;
                            popupImagePreview.innerHTML = `<img src="${imageData}" alt="Profile Preview">`;
                            
                            // Update profile icon preview in real-time
                            userProfileIcon.querySelector('.profile-circle').innerHTML = 
                                `<img src="${imageData}" alt="${userData.username}">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                // Add real-time username validation
                const usernameInput = document.getElementById('popupUsername');
                usernameInput.addEventListener('input', function(e) {
                    const newUsername = e.target.value.trim();
                    const isValid = isValidUsername(newUsername);
                    
                    if (newUsername === '') {
                        showValidationMessage(e.target, false, 'Username cannot be empty');
                    } else if (!isValid) {
                        showValidationMessage(e.target, false, 'Only letters, numbers, underscore (_) and hyphen (-) allowed');
                    } else {
                        showValidationMessage(e.target, true, 'Username is available');
                        // Update welcome message only if username is valid
                        updateWelcomeMessage(newUsername);
                    }
                });
                
                // Save profile changes
                document.getElementById('saveProfileBtn').addEventListener('click', function() {
                    const updatedUsername = document.getElementById('popupUsername').value.trim();
                    const updatedImageData = popupImagePreview.innerHTML.includes('img') ? 
                                            popupImagePreview.querySelector('img').src : null;
                    
                    if (!updatedUsername) {
                        showValidationMessage(document.getElementById('popupUsername'), false, 'Username cannot be empty');
                        return;
                    }
                    
                    if (!isValidUsername(updatedUsername)) {
                        showValidationMessage(document.getElementById('popupUsername'), false, 'Only letters, numbers, underscore (_) and hyphen (-) allowed');
                        return;
                    }
                    
                    // Update user data
                    userData.username = updatedUsername;
                    if (updatedImageData) {
                        userData.profileImage = updatedImageData;
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('xfitUser', JSON.stringify(userData));
                    
                    // Update the profile icon
                    if (userData.profileImage) {
                        userProfileIcon.querySelector('.profile-circle').innerHTML = 
                            `<img src="${userData.profileImage}" alt="${userData.username}">`;
                    }
                    
                    // Update welcome message
                    updateWelcomeMessage(userData.username);
                    
                    // Remove popup with animation
                    closeProfilePopup();
                });
                
                // Close popup
                document.getElementById('closeProfileBtn').addEventListener('click', function() {
                    closeProfilePopup();
                });
                
                // Close popup when clicking outside
                profilePopup.addEventListener('click', function(e) {
                    if (e.target === profilePopup) {
                        closeProfilePopup();
                    }
                });
            }
        });
    }
    
    // Function to close popup with animation
    function closeProfilePopup() {
        const popup = document.querySelector('.profile-popup');
        const popupContent = popup.querySelector('.popup-content');
        popupContent.style.animation = 'popupSlideOut 0.3s ease forwards';
        
        // Remove popup after animation completes
        setTimeout(() => {
            if (popup && popup.parentNode) {
                document.body.removeChild(popup);
            }
        }, 300);
    }
    
    // Show signup popup if first time user
    if (!user) {
        showSignupPopup();
    } else {
        // Load user profile and update welcome message
        loadUserProfile(user);
        updateWelcomeMessage(user.username);
    }
    
    function showSignupPopup() {
        // Create signup overlay
        const signupOverlay = document.createElement('div');
        signupOverlay.className = 'signup-overlay';
        
        // Create signup form
        const signupForm = document.createElement('div');
        signupForm.className = 'signup-form';
        
        signupForm.innerHTML = `
            <h2>Welcome to X-fitLife!</h2>
            <p>Create your account to get started</p>
            
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" required placeholder="Enter your username">
            </div>
            
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" required placeholder="Enter your email">
            </div>
            
            <div class="form-group">
                <label for="userImage">Profile Picture</label>
                <div class="image-upload-container">
                    <div class="image-preview" id="imagePreview">
                        <i class="fas fa-user"></i>
                    </div>
                    <label for="userImage" class="upload-button">
                        <i class="fas fa-camera"></i>
                        Choose Image
                    </label>
                    <input type="file" id="userImage" accept="image/*" style="display:none">
                </div>
            </div>
            
            <button type="button" id="saveUserBtn" class="cta-button">Create Account</button>
        `;
        
        // Append to body
        signupOverlay.appendChild(signupForm);
        document.body.appendChild(signupOverlay);
        
        // Add username validation to signup form
        const usernameInput = document.getElementById('username');
        usernameInput.addEventListener('input', function(e) {
            const newUsername = e.target.value.trim();
            const isValid = isValidUsername(newUsername);
            
            if (newUsername === '') {
                showValidationMessage(e.target, false, 'Username cannot be empty');
            } else if (!isValid) {
                showValidationMessage(e.target, false, 'Only letters, numbers, underscore (_) and hyphen (-) allowed');
            } else {
                showValidationMessage(e.target, true, 'Username is available');
            }
        });
        
        // Image preview functionality
        const imageInput = document.getElementById('userImage');
        const imagePreview = document.getElementById('imagePreview');
        
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Profile Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Save user data with validation
        const saveUserBtn = document.getElementById('saveUserBtn');
        saveUserBtn.addEventListener('click', function() {
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const imageData = imagePreview.innerHTML.includes('img') ? 
                              imagePreview.querySelector('img').src : null;
            
            if (!username) {
                showValidationMessage(document.getElementById('username'), false, 'Username cannot be empty');
                return;
            }
            
            if (!isValidUsername(username)) {
                showValidationMessage(document.getElementById('username'), false, 'Only letters, numbers, underscore (_) and hyphen (-) allowed');
                return;
            }
            
            if (!email) {
                alert('Please enter your email');
                return;
            }
            
            // Save to localStorage
            const userData = {
                username: username,
                email: email,
                profileImage: imageData,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('xfitUser', JSON.stringify(userData));
            
            // Remove signup overlay
            document.body.removeChild(signupOverlay);
            
            // Load user profile and update welcome message
            loadUserProfile(userData);
            updateWelcomeMessage(userData.username);
        });
    }
});
