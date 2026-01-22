// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Set hero section to visible immediately
const hero = document.querySelector('#hero');
if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
}

// Animation Section - Cursor-based image replacement
const animationImage = document.getElementById('animation-image');
const animationVideo = document.getElementById('animation-video');

if (animationImage && animationVideo) {
    // Generate array of all images in hero-anim folder (1.png through 12.png)
    const mediaFiles = Array.from({ length: 12 }, (_, i) => `hero-anim/${i + 1}.png`);
    let lastX = 0;
    let lastY = 0;
    let lastTime = Date.now();
    let velocity = 0;
    let currentMediaIndex = 0;
    
    // Helper function to get file extension
    function getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    // Helper function to determine if file is a video
    function isVideoFile(filename) {
        const ext = getFileExtension(filename);
        return ext === 'mp4' || ext === 'webm' || ext === 'ogg';
    }
    
    // Helper function to update media based on file type
    function updateMedia(filePath) {
        if (isVideoFile(filePath)) {
            // Hide image, show video
            animationImage.classList.remove('active');
            animationVideo.src = filePath;
            animationVideo.classList.add('active');
            animationVideo.play().catch(() => {
                // Handle autoplay restrictions
            });
        } else {
            // Hide video, show image
            animationVideo.classList.remove('active');
            animationVideo.pause();
            animationImage.src = filePath;
            animationImage.classList.add('active');
        }
    }
    
    // Initialize with first media file
    updateMedia(mediaFiles[0]);
    
    // Track cursor position and velocity anywhere in viewport
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const currentTime = Date.now();
        const timeDelta = currentTime - lastTime;
        
        // Calculate velocity (distance moved per time)
        if (timeDelta > 0 && lastX !== 0 && lastY !== 0) {
            const distance = Math.sqrt(
                Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2)
            );
            velocity = distance / timeDelta; // pixels per millisecond
        }
        
        // Map cursor X position to media index (divide viewport into more sections for frequent changes)
        const viewportWidth = window.innerWidth;
        const normalizedX = x / viewportWidth;
        // Create 9 sections (3 files × 3 cycles) for more frequent changes
        const sections = mediaFiles.length * 3;
        const newMediaIndex = Math.floor(normalizedX * sections) % mediaFiles.length;
        const clampedIndex = Math.max(0, Math.min(mediaFiles.length - 1, newMediaIndex));
        
        // Update media if index changed
        if (clampedIndex !== currentMediaIndex) {
            currentMediaIndex = clampedIndex;
            updateMedia(mediaFiles[currentMediaIndex]);
        }
        
        // Adjust transition speed based on velocity
        // Higher velocity = faster transition (lower duration)
        // Clamp velocity to reasonable range (0.1 to 2 pixels per ms)
        const normalizedVelocity = Math.max(0.1, Math.min(2, velocity));
        // Invert so higher velocity = lower duration (faster)
        const transitionDuration = Math.max(50, 200 - (normalizedVelocity * 75));
        const activeElement = animationImage.classList.contains('active') ? animationImage : animationVideo;
        activeElement.style.transition = `opacity ${transitionDuration}ms ease`;
        
        lastX = x;
        lastY = y;
        lastTime = currentTime;
    });
    
    // Reset velocity when mouse leaves viewport
    document.addEventListener('mouseleave', () => {
        velocity = 0;
        lastX = 0;
        lastY = 0;
    });
}

// Projects Section - Hover to show media at cursor
const projectRows = document.querySelectorAll('.projects-row');
const projectsMediaImage = document.getElementById('projects-media-image');
const projectsMediaVideo = document.getElementById('projects-media-video');
const projectsCursorMedia = document.getElementById('projects-cursor-media');

let currentMediaType = null;
let showMediaTimeout = null;
let isHovering = false;

// Update media position to follow cursor, ensuring it stays within viewport
function updateMediaPosition(e) {
    if (!isHovering) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get media dimensions (approximate based on CSS: 60vw max width, 60vh max height)
    const mediaWidth = Math.min(viewportWidth * 0.6, 600); // Max 60vw or 600px
    const mediaHeight = Math.min(viewportHeight * 0.6, 400); // Max 60vh or 400px
    
    // Calculate half dimensions for centering
    const halfWidth = mediaWidth / 2;
    const halfHeight = mediaHeight / 2;
    
    // Constrain position to keep media within viewport
    const constrainedX = Math.max(halfWidth, Math.min(x, viewportWidth - halfWidth));
    const constrainedY = Math.max(halfHeight, Math.min(y, viewportHeight - halfHeight));
    
    projectsCursorMedia.style.left = `${constrainedX}px`;
    projectsCursorMedia.style.top = `${constrainedY}px`;
    projectsCursorMedia.style.transform = 'translate(-50%, -50%)';
}

// Show media with slight delay to avoid flickering
function showMedia(row) {
    // Clear any existing timeout
    if (showMediaTimeout) {
        clearTimeout(showMediaTimeout);
    }
    
    showMediaTimeout = setTimeout(() => {
        const mediaPath = row.getAttribute('data-media');
        const mediaType = row.getAttribute('data-type');
        currentMediaType = mediaType;
        
        if (mediaType === 'video') {
            // Hide image, show video
            projectsMediaImage.classList.remove('active');
            projectsMediaVideo.src = mediaPath;
            projectsMediaVideo.classList.add('active');
            projectsMediaVideo.play().catch(() => {
                // Handle autoplay restrictions
            });
        } else if (mediaType === 'image') {
            // Hide video, show image
            projectsMediaVideo.classList.remove('active');
            projectsMediaVideo.pause();
            projectsMediaImage.src = mediaPath;
            projectsMediaImage.classList.add('active');
        }
    }, 100); // Small delay to prevent flickering
}

// Hide media immediately
function hideMedia() {
    if (showMediaTimeout) {
        clearTimeout(showMediaTimeout);
        showMediaTimeout = null;
    }
    
    projectsMediaImage.classList.remove('active');
    projectsMediaVideo.classList.remove('active');
    projectsMediaVideo.pause();
    currentMediaType = null;
}

projectRows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
        isHovering = true;
        updateMediaPosition(e);
        showMedia(row);
    });
    
    row.addEventListener('mousemove', (e) => {
        if (isHovering) {
            updateMediaPosition(e);
        }
    });
    
    row.addEventListener('mouseleave', () => {
        isHovering = false;
        hideMedia();
    });
});

// Also track mouse movement globally to update position even when moving between rows
document.addEventListener('mousemove', (e) => {
    if (isHovering) {
        updateMediaPosition(e);
    }
});
