let currentSong = new Audio();
let play = document.getElementById("play")
let songs;
let currfolder;
let cardcontainer = document.querySelector(".cardcontainer")
// seconds to minutes

function formatTimeDisplay(currentTime, duration) {
    function format(timeInSeconds) {
        if (isNaN(duration) || duration < 0) {
            return "00:00"
        }
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${format(currentTime)} / ${format(duration)}`;
}

async function getsongs(folder) {
    currfolder = folder;

    let res = await fetch(`songs/${folder}/songs.json`);
    songs = await res.json();
    // Attach songs to the list
    let songlist = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songlist.innerHTML = "";
    for (const song of songs) {
        songlist.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div></div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert play-btn" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            let audio = element.querySelector(".info").firstElementChild.innerHTML;
            playmusic(audio);
        });
    });

    return songs;
}
const playmusic = (track, pause = false) => {
    currentSong.src = `songs/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayalbums() {
    let folders = ["Anuv jain","playlist1", "playlist2"]; // Add all playlist folders here manually
    for (let folder of folders) {
        try {
            let res = await fetch(`songs/${folder}/info.json`);
            let response = await res.json();
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                <svg width="48" height="48" ...></svg>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h3>${response.title}</h3>
                <p class="grey">${response.description}</p>
            </div>`;
        } catch (err) {
            console.error("Error loading album:", folder, err);
        }
    }

    // Playlist click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getsongs(e.dataset.folder);
            playmusic(songs[0]);
            document.querySelector(".left").style.left = "0%";
            document.querySelector(".hamburger").style.display = "none";
            document.querySelector(".close").style.display = "block";
        });
    });
}

async function main() {
    await getsongs("playlist1")
    playmusic(songs[0], true)

    //display albums
    displayalbums()

    // event listener for play , next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    // time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = formatTimeDisplay(currentSong.currentTime, currentSong.duration)
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        if (document.querySelector(".circle").style.left == "100%") {
            play.src = "img/play.svg"
        } else if (!currentSong.paused) {
            play.src = "img/pause.svg"
        }
    })
    // Add even listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration) * percent / 100
    })
    // hamburger event listener
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
        document.querySelector(".left").style.transition = "0.6s ease-out"
        document.querySelector(".hamburger").style.display = "none"
        document.querySelector(".close").style.display = "block"
        document.querySelector(".close").style.transition = "0.5s ease-out"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".left").style.transition = "0.8s ease-in-out"
        document.querySelector(".close").style.display = "none"
        document.querySelector(".close").style.transition = "0.6s ease-out"
        document.querySelector(".hamburger").style.display = "block"
        document.querySelector(".hamburger").style.transition = "0.6s ease-out"
    })
    // add event listener to previus and next

    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURI(currentSong.src.split("/")[5]))
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
        else {
            playmusic(songs[songs.length - 1])
        }

    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURI(currentSong.src.split("/")[5]))
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
        else {
            playmusic(songs[0])
        }
    })
    // reload event listener
    document.querySelector(".logo").addEventListener('click', function () {
        location.reload();
    });
    document.querySelector(".home").addEventListener('click', function () {
        location.reload();
    });
    document.querySelector(".buttons").getElementsByTagName("li")[0].addEventListener('click', function () {
        location.reload();
    });
    document.querySelector(".btn").addEventListener('click', function () {
        location.reload();
    });
    // volume event listener
    document.querySelector(".range-input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume == 0) {
            document.querySelector(".volume-svg").src = "img/volumeoff.svg"
        } else {
            document.querySelector(".volume-svg").src = "img/volume.svg"
        }
    })
    // volume button event listener
    document.querySelector(".volume-svg").addEventListener("click", () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0
            document.querySelector(".range-input").value = 0
            document.querySelector(".volume-svg").src = "img/volumeoff.svg"
        } else {
            currentSong.volume = 0.5
            document.querySelector(".range-input").value = 50
            document.querySelector(".volume-svg").src = "img/volume.svg"
        }
    })
}
main()