document.addEventListener('DOMContentLoaded', function() {
    // Apply theme from localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Get DOM elements
    const notesList = document.getElementById('notesList');
    const notesEmpty = document.getElementById('notesEmpty');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const noteModal = document.getElementById('noteModal');
    const closeModal = document.getElementById('closeModal');
    const saveNoteBtn = document.getElementById('saveNote');
    const deleteNoteBtn = document.getElementById('deleteNote');
    const completeNoteBtn = document.getElementById('completeNote');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const searchInput = document.getElementById('searchNotes');
    const sortButton = document.getElementById('sortButton');
    const categoryOptions = document.querySelectorAll('.category-option');
    const deletePopup = document.getElementById('deletePopup');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    // User profile functionality
    const userProfileIcon = document.getElementById('userProfileIcon');
    if (userProfileIcon) {
        const userData = JSON.parse(localStorage.getItem('xfitUser'));
        if (userData && userData.profileImage) {
            userProfileIcon.querySelector('.profile-circle').innerHTML = 
                `<img src="${userData.profileImage}" alt="${userData.username}">`;
        }
    }
    
    // Notes variables
    let notes = JSON.parse(localStorage.getItem('xfitNotes')) || [];
    let currentNoteId = null;
    let selectedCategory = 'workout';
    let sortOrder = 'newest'; // 'newest' or 'oldest'
    let isCompleted = false;
    
    // Icons for categories
    const categoryIcons = {
        'workout': 'fas fa-dumbbell',
        'nutrition': 'fas fa-apple-alt',
        'goals': 'fas fa-bullseye',
        'other': 'fas fa-sticky-note'
    };
    
    // Colors for categories
    const categoryColors = {
        'workout': '#8880FE',
        'nutrition': '#1dd1a1',
        'goals': '#ff6b6b',
        'other': '#54a0ff'
    };
    
    // RGB values for category backgrounds (without the # and converted to RGB)
    const categoryRGB = {
        'workout': '136, 128, 254',
        'nutrition': '29, 209, 161',
        'goals': '255, 107, 107',
        'other': '84, 160, 255'
    };
    
    // Initialize the notes list
    function initNotes() {
        renderNotes();
        updateEmptyState();
    }
    
    // Create a new note
    function createNote(title, content, category) {
        const newNote = {
            id: Date.now().toString(),
            title: title,
            content: content,
            category: category,
            completed: isCompleted,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.push(newNote);
        saveNotes();
        renderNotes();
        updateEmptyState();
    }
    
    // Update an existing note
    function updateNote(id, title, content, category) {
        const note = notes.find(note => note.id === id);
        if (note) {
            note.title = title;
            note.content = content;
            note.category = category;
            note.completed = isCompleted;
            note.updatedAt = new Date().toISOString();
            saveNotes();
            renderNotes();
        }
    }
    
    // Delete a note
    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
        updateEmptyState();
    }
    
    // Save notes to localStorage
    function saveNotes() {
        localStorage.setItem('xfitNotes', JSON.stringify(notes));
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        
        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return 'Today, ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        
        // If yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        // Otherwise show date
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
    
    // Render notes list
    function renderNotes() {
        if (!notesList) return;
        
        // Sort notes based on current sort order
        const sortedNotes = [...notes].sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            } else {
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            }
        });
        
        // Filter notes if search is active
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filteredNotes = searchTerm ? 
            sortedNotes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            ) : sortedNotes;
        
        // Clear current list
        notesList.innerHTML = '';
        
        // Add filtered notes
        filteredNotes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            if (note.completed) {
                noteCard.classList.add('completed');
            }
            noteCard.setAttribute('data-id', note.id);
            
            // Apply color styles to note card
            const catColor = categoryColors[note.category] || '#8880FE';
            const catRGB = categoryRGB[note.category] || '136, 128, 254';
            noteCard.style.setProperty('--category-color', catColor);
            noteCard.style.setProperty('--category-rgb', catRGB);
            
            // Check if content is long enough to need "show more"
            const content = note.content || 'No content';
            const needsShowMore = content.length > 180; // Approximate length for 3 lines
            
            noteCard.innerHTML = `
                <div class="note-title">${escapeHtml(note.title || 'Untitled Note')}</div>
                <div class="note-preview ${needsShowMore ? 'collapsed' : ''}" data-full-text="${escapeHtml(content)}">
                    ${escapeHtml(content)}
                </div>
                ${needsShowMore ? 
                    `<div class="show-more-btn" data-action="expand">Show more</div>` : 
                    ''}
                <div class="note-meta">
                    <div class="note-category">
                        <i class="${categoryIcons[note.category] || 'fas fa-sticky-note'}"></i>
                        <span>${capitalizeFirstLetter(note.category)}</span>
                    </div>
                    <div class="note-date">${formatDate(note.updatedAt)}</div>
                </div>
                ${note.completed ? '<div class="completed-badge"><i class="fas fa-check"></i></div>' : ''}
            `;
            
            // Add event listener for show more/less button
            const showMoreBtn = noteCard.querySelector('.show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent opening the note editor
                    const preview = this.previousElementSibling;
                    const action = this.getAttribute('data-action');
                    
                    if (action === 'expand') {
                        preview.classList.remove('collapsed');
                        preview.classList.add('expanded');
                        this.textContent = 'Show less';
                        this.setAttribute('data-action', 'collapse');
                    } else {
                        preview.classList.remove('expanded');
                        preview.classList.add('collapsed');
                        this.textContent = 'Show more';
                        this.setAttribute('data-action', 'expand');
                    }
                });
            }
            
            // Open note when clicking on the card (except when clicking show more/less)
            noteCard.addEventListener('click', function(e) {
                if (!e.target.closest('.show-more-btn')) {
                    openNoteForEdit(note.id);
                }
            });
            
            notesList.appendChild(noteCard);
        });
        
        // Show empty search message if needed
        if (filteredNotes.length === 0 && searchTerm) {
            const emptySearch = document.createElement('div');
            emptySearch.className = 'notes-empty';
            emptySearch.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No results found</h3>
                <p>Try a different search term</p>
            `;
            notesList.appendChild(emptySearch);
        }
        
        // Dispatch event that notes have been rendered
        document.dispatchEvent(new CustomEvent('notesRendered'));
    }
    
    // Update empty state visibility
    function updateEmptyState() {
        if (notes.length === 0) {
            notesEmpty.style.display = 'flex';
            notesList.style.display = 'none';
        } else {
            notesEmpty.style.display = 'none';
            notesList.style.display = 'flex';
        }
    }
    
    // Open note modal for creating a new note
    function openNewNoteModal() {
        currentNoteId = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        isCompleted = false;
        
        // Set default category
        selectCategory('workout');
        
        // Hide delete and complete buttons for new notes
        deleteNoteBtn.classList.add('hidden');
        completeNoteBtn.classList.add('hidden');
        
        // Reset complete button state
        completeNoteBtn.classList.remove('active');
        completeNoteBtn.setAttribute('title', 'Mark as completed');
        completeNoteBtn.querySelector('i').className = 'fas fa-check';
        
        // Show the modal
        noteModal.classList.add('active');
        
        // Focus on title input after modal is visible
        setTimeout(() => {
            noteTitleInput.focus();
        }, 300);
    }
    
    // Open note for editing
    function openNoteForEdit(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        
        currentNoteId = noteId;
        noteTitleInput.value = note.title || '';
        noteContentInput.value = note.content || '';
        isCompleted = note.completed || false;
        
        // Set the category
        selectCategory(note.category);
        
        // Show buttons for existing notes
        deleteNoteBtn.classList.remove('hidden');
        completeNoteBtn.classList.remove('hidden');
        
        // Update complete button based on note status
        if (isCompleted) {
            completeNoteBtn.classList.add('active');
            completeNoteBtn.setAttribute('title', 'Mark as incomplete');
            completeNoteBtn.querySelector('i').className = 'fas fa-check-double';
        } else {
            completeNoteBtn.classList.remove('active');
            completeNoteBtn.setAttribute('title', 'Mark as completed');
            completeNoteBtn.querySelector('i').className = 'fas fa-check';
        }
        
        // Show the modal
        noteModal.classList.add('active');
        
        // Focus on content after modal is visible
        setTimeout(() => {
            // Place cursor at the end of the content
            noteContentInput.focus();
            noteContentInput.setSelectionRange(
                noteContentInput.value.length,
                noteContentInput.value.length
            );
        }, 300);
    }
    
    // Select a category
    function selectCategory(category) {
        selectedCategory = category;
        
        // Update UI to show selected category
        categoryOptions.forEach(option => {
            const optionCategory = option.getAttribute('data-category');
            if (optionCategory === category) {
                option.classList.add('selected');
                option.style.color = option.getAttribute('data-color');
            } else {
                option.classList.remove('selected');
                option.style.color = '';
            }
        });
    }
    
    // Close note modal
    function closeNoteModal() {
        // Reset modal position and opacity first
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
            modalContent.style.transition = '';
        }
        
        // Then remove the active class after a slight delay to allow animation
        setTimeout(() => {
            noteModal.classList.remove('active');
            
            // Reset swipe state
            window.swipeStartY = null;
            touchStartY = 0;
            touchMoveY = 0;
        }, 50);
    }
    
    // Save current note
    function saveCurrentNote() {
        let title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title && !content) {
            alert('Please add a title or content to your note');
            return;
        }
        
        // If title is too long, truncate it
        const MAX_TITLE_LENGTH = 40;
        if (title.length > MAX_TITLE_LENGTH) {
            title = title.substring(0, MAX_TITLE_LENGTH) + '...';
        }
        
        // If no title but has content, create a title from content
        if (!title && content) {
            title = content.split('\n')[0]; // First line of content
            if (title.length > MAX_TITLE_LENGTH) {
                title = title.substring(0, MAX_TITLE_LENGTH) + '...';
            }
        }
        
        let isNewNote = !currentNoteId;
        
        if (currentNoteId) {
            // Update existing note
            updateNote(currentNoteId, title, content, selectedCategory);
        } else {
            // Create new note
            currentNoteId = Date.now().toString(); // Generate a new ID
            createNote(title, content, selectedCategory);
        }
        
        closeNoteModal();
        
        // If the user immediately reopens the newly created note,
        // ensure the buttons are shown correctly
        if (isNewNote) {
            const noteId = currentNoteId;
            setTimeout(() => {
                const note = notes.find(n => n.id === noteId);
                if (note) {
                    // Reset the current note ID to avoid confusion
                    currentNoteId = null;
                }
            }, 100);
        }
    }
    
    // Toggle completed status
    function toggleCompleted() {
        isCompleted = !isCompleted;
        
        // Update button appearance and tooltip based on completed state
        if (isCompleted) {
            completeNoteBtn.classList.add('active');
            completeNoteBtn.setAttribute('title', 'Mark as incomplete');
            completeNoteBtn.querySelector('i').className = 'fas fa-check-double';
        } else {
            completeNoteBtn.classList.remove('active');
            completeNoteBtn.setAttribute('title', 'Mark as completed');
            completeNoteBtn.querySelector('i').className = 'fas fa-check';
        }
    }
    
    // Delete current note
    function deleteCurrentNote() {
        if (!currentNoteId) return;
        
        // Show delete confirmation popup
        deletePopup.classList.add('active');
    }
    
    // Confirm delete action
    function confirmDelete() {
        if (!currentNoteId) return;
        
        deleteNote(currentNoteId);
        closeNoteModal();
        closeDeletePopup();
    }
    
    // Close delete popup
    function closeDeletePopup() {
        deletePopup.classList.remove('active');
    }
    
    // Toggle sort order
    function toggleSortOrder() {
        sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
        renderNotes();
        
        // Update the sort button icon
        sortButton.innerHTML = sortOrder === 'newest' 
            ? '<i class="fas fa-sort-amount-down"></i>' 
            : '<i class="fas fa-sort-amount-up"></i>';
    }
    
    // Helper functions
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Event Listeners
    addNoteBtn.addEventListener('click', openNewNoteModal);
    closeModal.addEventListener('click', closeNoteModal);
    saveNoteBtn.addEventListener('click', saveCurrentNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    completeNoteBtn.addEventListener('click', toggleCompleted);
    cancelDeleteBtn.addEventListener('click', closeDeletePopup);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    sortButton.addEventListener('click', toggleSortOrder);
    
    // Close modal or popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (deletePopup.classList.contains('active')) {
                closeDeletePopup();
            } else if (noteModal.classList.contains('active')) {
                closeNoteModal();
            }
        }
    });
    
    // Add swipe down to close for touch devices
    let touchStartY = 0;
    let touchMoveY = 0;
    let activeSwipe = false;
    
    if (noteModal) {
        // Add touchstart listener to document to catch all touch events
        document.addEventListener('touchstart', function(e) {
            // Only start if modal is active
            if (!noteModal.classList.contains('active')) {
                return;
            }
            
            const touch = e.touches[0];
            const target = touch.target;
            
            const modalBody = document.querySelector('.modal-body');
            const isModalHeader = target.closest('.modal-header');
            const isTopOfModalBody = target.closest('.modal-body') && 
                                   modalBody.scrollTop < 10 && 
                                   touch.clientY < modalBody.getBoundingClientRect().top + 30;
            
            if (isModalHeader || isTopOfModalBody) {
                touchStartY = touch.clientY;
                window.swipeStartY = touchStartY; // Store globally to track swipe state
                activeSwipe = true;
            }
        });
        
        // Move touchmove and touchend to document to catch events outside modal
        document.addEventListener('touchmove', function(e) {
            if (activeSwipe && window.swipeStartY !== null) {
                const modalContent = document.querySelector('.modal-content');
                if (!modalContent) return;
                
                touchMoveY = e.touches[0].clientY;
                const swipeDist = touchMoveY - window.swipeStartY;
                
                // Only allow downward swipe
                if (swipeDist > 0) {
                    modalContent.style.transform = `translateY(${swipeDist}px)`;
                    modalContent.style.opacity = 1 - (swipeDist / 300);
                }
            }
        });
        
        document.addEventListener('touchend', function(e) {
            if (activeSwipe && window.swipeStartY !== null) {
                const modalContent = document.querySelector('.modal-content');
                if (!modalContent) return;
                
                const swipeDist = touchMoveY - window.swipeStartY;
                
                // If swiped down more than 100px, close the modal
                if (swipeDist > 100) {
                    // First reset the transition for a smooth closing animation
                    modalContent.style.transition = 'transform 0.3s, opacity 0.3s';
                    modalContent.style.transform = `translateY(${window.innerHeight}px)`;
                    modalContent.style.opacity = '0';
                    
                    // Close after animation completes
                    setTimeout(() => {
                        closeNoteModal();
                    }, 300);
                } else {
                    // Reset position and opacity with animation
                    modalContent.style.transition = 'transform 0.3s, opacity 0.3s';
                    modalContent.style.transform = 'translateY(0)';
                    modalContent.style.opacity = '1';
                    
                    // Remove the transition after it completes
                    setTimeout(() => {
                        modalContent.style.transition = '';
                    }, 300);
                }
                
                // Reset swipe state
                window.swipeStartY = null;
                touchStartY = 0;
                touchMoveY = 0;
                activeSwipe = false;
            }
        });
        
        // Also reset on modal close
        noteModal.addEventListener('click', function(e) {
            if (e.target === noteModal) {
                // Reset any lingering swipe state
                window.swipeStartY = null;
                touchStartY = 0;
                touchMoveY = 0;
                activeSwipe = false;
                
                closeNoteModal();
            }
        });
    }
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        renderNotes();
    });
    
    // Category selection
    categoryOptions.forEach(option => {
        option.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            selectCategory(category);
        });
    });
    
    // Close modal when clicking outside
    noteModal.addEventListener('click', function(e) {
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });
    
    // Scroll to top functionality
    function initScrollToTop() {
        const contentArea = document.querySelector('.notes-content');
        
        // Remove debugging log
        function checkScrollPosition() {
            // Lower threshold to make button appear sooner
            if (contentArea.scrollTop > 200) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
        
        // Check scroll position periodically (fallback method)
        setInterval(checkScrollPosition, 1000);
        
        // Also check on window resize
        window.addEventListener('resize', checkScrollPosition);
        
        // Show/hide scroll button based on scroll position
        contentArea.addEventListener('scroll', checkScrollPosition);
        
        // Initial check
        setTimeout(checkScrollPosition, 500);
        
        // Scroll to top when button is clicked
        scrollTopBtn.addEventListener('click', function() {
            // Smooth scroll to top
            contentArea.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Force visibility check when notes are rendered
        document.addEventListener('notesRendered', checkScrollPosition);
    }
    
    // Initialize notes on page load
    initNotes();
    initScrollToTop();
}); 