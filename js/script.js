console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder;
let currentlyPlayingIndex = -1;

// Album data
const mockAlbums = [
    { folder: "Chill_(mood)", title: "Chill Mood", description: "Relaxing chill music", cover: "songs/Chill_(mood)/cover.jpg" },
    { folder: "Angry_(mood)", title: "Angry Mood", description: "Calm your Anger", cover: "songs/Angry_(mood)/cover.jpg" },
    { folder: "Bright_(mood)", title: "Bright Mood", description: "Upbeat and cheerful music", cover: "songs/Bright_(mood)/cover.jpg" },
    { folder: "Dark_(mood)", title: "Dark Mood", description: "Mysterious and intense music", cover: "songs/Dark_(mood)/cover.jpg" },
    { folder: "Funky_(mood)", title: "Funky Mood", description: "Groovy funky beats", cover: "songs/Funky_(mood)/cover.jpg" },
    { folder: "Love_(mood)", title: "Love Mood", description: "Romantic love songs", cover: "songs/Love_(mood)/cover.jpg" },
    { folder: "Uplifting_(mood)", title: "Uplifting Mood", description: "Motivational uplifting tracks", cover: "songs/Uplifting_(mood)/cover.jpg" },
    { folder: "ncs", title: "No Copyright Songs", description: "Best no copyright music", cover: "songs/ncs/cover.jpg" },
    { folder: "Diljit", title: "Diljit Hits", description: "Popular Diljit songs", cover: "songs/Diljit/cover.jpg" },
    { folder: "karan aujia", title: "Karan Aujia", description: "Karan Aujia special tracks", cover: "songs/karan aujia/cover.jpg" }
];

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Function to update play button in playbar
function updatePlayButton(isPlaying) {
    const playBtn = document.getElementById("play");
    if (playBtn) {
        playBtn.src = isPlaying ? "img/pause.svg" : "img/play.svg";
        console.log("🔄 Playbar button updated to:", isPlaying ? "pause.svg" : "play.svg");
    }
}

// Function to update library play icons
function updateLibraryPlayIcons(playingIndex) {
    // Reset all library icons to play
    const allLibraryIcons = document.querySelectorAll(".songList .playnow img");
    allLibraryIcons.forEach(icon => {
        icon.src = "img/play.svg";
    });
    
    // Set the currently playing song to pause icon
    if (playingIndex >= 0 && playingIndex < allLibraryIcons.length) {
        allLibraryIcons[playingIndex].src = "img/pause.svg";
        console.log("📚 Library icon updated for index:", playingIndex);
    }
}

// Function to get songs from folder by scanning actual files
async function getSongsFromFolder(folder) {
    try {
        console.log("🔍 Scanning folder:", folder);
        
        // For folders with spaces, we need to handle them differently
        let folderPath = folder;
        
        const response = await fetch(`/${folderPath}/`);
        if (!response.ok) {
            throw new Error(`Cannot access folder: ${folder}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.getElementsByTagName('a');
        
        const songList = [];
        
        for (let link of links) {
            const href = link.href;
            // Look for .mp3 files
            if (href.includes('.mp3') && !href.includes('cover.jpg') && !href.includes('info.json')) {
                // Extract filename from URL
                const urlParts = href.split('/');
                let fileName = urlParts[urlParts.length - 1];
                
                // Clean the filename - remove any URL encoding or extra paths
                fileName = decodeURIComponent(fileName);
                
                // If it still has path separators, extract just the filename
                if (fileName.includes('\\')) {
                    fileName = fileName.split('\\').pop();
                }
                if (fileName.includes('/')) {
                    fileName = fileName.split('/').pop();
                }
                
                if (fileName && fileName.endsWith('.mp3')) {
                    console.log("🎵 Found song:", fileName);
                    songList.push(fileName);
                }
            }
        }
        
        console.log(`✅ Found ${songList.length} songs in ${folder}:`, songList);
        return songList;
        
    } catch (error) {
        console.warn(`❌ Could not scan folder ${folder}:`, error);
        
        // For karan aujia folder, let's try with URL encoded version
        if (folder === "songs/karan aujia") {
            console.log("🔄 Trying URL encoded version for karan aujia folder...");
            try {
                const encodedFolder = "songs/karan%20aujia";
                const response = await fetch(`/${encodedFolder}/`);
                if (response.ok) {
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const links = doc.getElementsByTagName('a');
                    
                    const songList = [];
                    
                    for (let link of links) {
                        const href = link.href;
                        if (href.includes('.mp3') && !href.includes('cover.jpg') && !href.includes('info.json')) {
                            const urlParts = href.split('/');
                            let fileName = urlParts[urlParts.length - 1];
                            fileName = decodeURIComponent(fileName);
                            
                            if (fileName.includes('\\')) {
                                fileName = fileName.split('\\').pop();
                            }
                            if (fileName.includes('/')) {
                                fileName = fileName.split('/').pop();
                            }
                            
                            if (fileName && fileName.endsWith('.mp3')) {
                                console.log("🎵 Found song in encoded folder:", fileName);
                                songList.push(fileName);
                            }
                        }
                    }
                    
                    console.log(`✅ Found ${songList.length} songs in encoded folder:`, songList);
                    return songList;
                }
            } catch (error2) {
                console.warn("❌ Could not access encoded folder either:", error2);
            }
        }
        
        // Final fallback - use actual song names that should exist
        const folderName = folder.replace('songs/', '');
        switch(folderName) {
            case "Chill_(mood)": return ["Straw Squeak (1).mp3", "Straw Squeak.mp3"];
            case "Angry_(mood)": return ["Straw Squeak (4).mp3", "Truck Driving in Parking Structure.mp3"];
            case "Bright_(mood)": return ["Straw Squeak (2).mp3", "Straw Squeak (3).mp3"];
            case "Funky_(mood)": return ["on The Flip The Grey Room Density & Time.mp3"];
            case "Uplifting_(mood)": return ["Car Drive By.mp3"];
            case "karan aujia": 
                // Try to guess the actual song names in karan aujia folder
                return ["Karan Song 1.mp3", "Karan Song 2.mp3", "Song 1.mp3", "Song 2.mp3"];
            default: return ["Song 1.mp3", "Song 2.mp3"];
        }
    }
}

async function getSongs(folder) {
    return new Promise(async (resolve) => {
        currFolder = folder;
        console.log("📂 Loading songs from:", folder);
        
        // Get real songs by scanning the folder
        const realSongs = await getSongsFromFolder(folder);
        songs = realSongs;
        
        // Update the song list in the left sidebar
        let songUL = document.querySelector(".songList ul");
        if (songUL) {
            songUL.innerHTML = "";
            songs.forEach((song, index) => {
                let displayName = song.replace('.mp3', '');
                
                songUL.innerHTML += `<li>
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${displayName}</div>
                        <div>Asif</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="" data-index="${index}">
                    </div>
                </li>`;
            });

            // Add click events to songs
            Array.from(songUL.querySelectorAll("li")).forEach((li, index) => {
                li.addEventListener("click", () => {
                    if (songs[index]) {
                        console.log("🎵 User clicked on:", songs[index], "at index:", index);
                        playMusic(songs[index], index);
                    }
                });
            });
        }
        
        console.log("✅ Final songs loaded:", songs);
        resolve(songs);
    });
}

function playMusic(track, index = -1, pause = false) {
    if (!track) {
        console.error("❌ No track provided to playMusic");
        return;
    }
    
    console.log("🎵 Attempting to play:", track);
    console.log("📁 From folder:", currFolder);
    console.log("📊 Song index:", index);
    
    // Stop current song if playing
    if (!currentSong.paused) {
        currentSong.pause();
    }
    
    // Create new audio object
    currentSong = new Audio();
    currentSong.currentTrack = track;
    
    // Set the source to the actual MP3 file
    // Clean the track name first
    let cleanTrack = track;
    
    // Remove any path components if present
    if (cleanTrack.includes('\\')) {
        cleanTrack = cleanTrack.split('\\').pop();
    }
    if (cleanTrack.includes('/')) {
        cleanTrack = cleanTrack.split('/').pop();
    }
    
    // For karan aujia folder, handle the space in folder name
    let folderPath = currFolder;
    if (currFolder === "songs/karan aujia") {
        folderPath = "songs/karan%20aujia";
    }
    
    // URL encode the clean filename
    const encodedTrack = encodeURIComponent(cleanTrack);
    currentSong.src = `/${folderPath}/${encodedTrack}`;
    
    console.log("🔗 Audio source set to:", currentSong.src);
    console.log("📝 Clean track name:", cleanTrack);
    console.log("📁 Folder path:", folderPath);
    
    // Update song info in playbar
    let displayName = cleanTrack.replace('.mp3', '');
    
    const songInfo = document.querySelector(".songinfo");
    if (songInfo) {
        songInfo.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;">
            <img width="40" src="img/music.svg" alt="" style="border-radius: 4px;">
            <div>
                <div style="font-weight: bold; color: black;">${displayName}</div>
                <div style="color: #666; font-size: 0.8rem;">Artist</div>
            </div>
        </div>`;
    }
    
    // Update play button to show pause icon immediately
    updatePlayButton(true);
    
    // Update library play icon
    if (index >= 0) {
        currentlyPlayingIndex = index;
        updateLibraryPlayIcons(index);
    }
    
    // Update play button
    if (!pause) {
        // Actually play the audio file
        currentSong.play().then(() => {
            console.log("✅ Audio started playing successfully!");
            startProgressUpdate();
        }).catch(error => {
            console.error("❌ Error playing audio:", error);
            console.log("🔍 Debug info:");
            console.log("   - Folder:", currFolder);
            console.log("   - Folder Path:", folderPath);
            console.log("   - Original track:", track);
            console.log("   - Clean track:", cleanTrack);
            console.log("   - Full URL:", currentSong.src);
            
            // Update play button back to play icon if error
            updatePlayButton(false);
            updateLibraryPlayIcons(-1); // Reset all library icons
            
            // Show specific error message
            const songInfo = document.querySelector(".songinfo");
            if (songInfo) {
                songInfo.innerHTML += `<div style="color: red; font-size: 0.7rem;">
                    ❌ Cannot play: ${cleanTrack}<br>
                    🔍 File not found in ${currFolder}<br>
                    💡 Check if file exists in the folder
                </div>`;
            }
        });
    }
}

function startProgressUpdate() {
    // Clear any existing interval
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    
    // Update progress based on actual audio time
    window.progressInterval = setInterval(() => {
        if (!currentSong.paused && currentSong.duration && !isNaN(currentSong.duration)) {
            const progress = (currentSong.currentTime / currentSong.duration) * 100;
            const circle = document.querySelector(".circle");
            if (circle) {
                circle.style.left = Math.min(progress, 100) + "%";
            }
            
            const songTime = document.querySelector(".songtime");
            if (songTime) {
                songTime.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            }
            
            // Auto play next song when current ends
            if (currentSong.currentTime >= currentSong.duration - 0.5) {
                playNextSong();
            }
        } else {
            // If no duration yet, show loading
            const songTime = document.querySelector(".songtime");
            if (songTime) {
                songTime.innerHTML = `00:00 / 00:00`;
            }
        }
    }, 100);
}

function playNextSong() {
    if (songs.length > 0 && currentSong.currentTrack) {
        const currentIndex = songs.indexOf(currentSong.currentTrack);
        const newIndex = (currentIndex + 1) % songs.length;
        if (songs[newIndex]) {
            playMusic(songs[newIndex], newIndex);
        }
    }
}

function playPreviousSong() {
    if (songs.length > 0 && currentSong.currentTrack) {
        const currentIndex = songs.indexOf(currentSong.currentTrack);
        const newIndex = (currentIndex - 1 + songs.length) % songs.length;
        if (songs[newIndex]) {
            playMusic(songs[newIndex], newIndex);
        }
    }
}

function displayAlbums() {
    return new Promise((resolve) => {
        console.log("🖼️ Displaying albums...");
        
        const cardContainer = document.querySelector(".cardContainer");
        
        if (!cardContainer) {
            console.error("❌ Card container not found!");
            resolve();
            return;
        }
        
        cardContainer.innerHTML = "";
        
        mockAlbums.forEach(album => {
            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("data-folder", `songs/${album.folder}`);
            
            card.innerHTML = ` 
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="${album.cover}" alt="${album.title}" 
                     style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"
                     onerror="this.src='img/music.svg'; this.style.padding='20px'; this.style.backgroundColor='#252525';">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            `;
            
            cardContainer.appendChild(card);
        });

        console.log(`✅ Created ${mockAlbums.length} album cards`);

        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", function() {
                const folder = this.getAttribute("data-folder");
                console.log("🎵 Album clicked:", folder);
                getSongs(folder).then(songs => {
                    console.log("📝 Songs found:", songs.length);
                    if (songs.length > 0) {
                        playMusic(songs[0], 0);
                    } else {
                        console.log("❌ No songs found in this folder");
                    }
                });
            });
        });
        
        resolve();
    });
}

function setupEventListeners() {
    const playBtn = document.getElementById("play");
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play().then(() => {
                    updatePlayButton(true);
                    updateLibraryPlayIcons(currentlyPlayingIndex);
                    startProgressUpdate();
                }).catch(error => {
                    console.error("Error playing audio:", error);
                });
            } else {
                currentSong.pause();
                updatePlayButton(false);
                updateLibraryPlayIcons(-1); // Reset library icons when paused
                if (window.progressInterval) {
                    clearInterval(window.progressInterval);
                }
            }
        });
    }

    const prevBtn = document.getElementById("previous");
    if (prevBtn) {
        prevBtn.addEventListener("click", playPreviousSong);
    }

    const nextBtn = document.getElementById("next");
    if (nextBtn) {
        nextBtn.addEventListener("click", playNextSong);
    }

    const seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        seekbar.addEventListener("click", (e) => {
            if (currentSong.duration && !isNaN(currentSong.duration)) {
                const rect = seekbar.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                const newTime = (currentSong.duration * percent) / 100;
                currentSong.currentTime = newTime;
                
                const circle = document.querySelector(".circle");
                if (circle) {
                    circle.style.left = Math.max(0, Math.min(100, percent)) + "%";
                }
            }
        });
    }

    const volumeInput = document.querySelector(".range input");
    const volumeImg = document.querySelector(".volume>img");
    
    if (volumeInput) {
        volumeInput.value = 50;
        currentSong.volume = 0.5;
        volumeInput.addEventListener("input", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
            
            if (volumeImg) {
                if (currentSong.volume === 0) {
                    volumeImg.src = "img/mute.svg";
                } else {
                    volumeImg.src = "img/volume.svg";
                }
            }
        });
    }

    if (volumeImg) {
        volumeImg.addEventListener("click", () => {
            if (volumeInput) {
                if (currentSong.volume > 0) {
                    currentSong.volume = 0;
                    volumeInput.value = 0;
                    volumeImg.src = "img/mute.svg";
                } else {
                    currentSong.volume = 0.5;
                    volumeInput.value = 50;
                    volumeImg.src = "img/volume.svg";
                }
            }
        });
    }

    const hamburger = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close");
    
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            const leftPanel = document.querySelector(".left");
            if (leftPanel) {
                leftPanel.style.left = "0";
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            const leftPanel = document.querySelector(".left");
            if (leftPanel) {
                leftPanel.style.left = "-120%";
            }
        });
    }
}

async function main() {
    console.log("🚀 Starting Spotify Clone...");
    console.log("🎵 Fixed library play icons for better UX");
    
    // Display albums
    await displayAlbums();
    
    // Load songs from default folder
    await getSongs("songs/Chill_(mood)");
    setupEventListeners();
    
    const songTime = document.querySelector(".songtime");
    if (songTime) {
        songTime.innerHTML = "00:00 / 00:00";
    }
    
    console.log("✅ Spotify Clone started successfully!");
    console.log("📢 Run: python -m http.server 8000");
    console.log("💡 Open: http://localhost:8000");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}