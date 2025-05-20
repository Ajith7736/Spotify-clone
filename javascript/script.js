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
    let a = await fetch(`songs/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1])
        }
    }
    //attach songs to the list 
    let songlist = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songlist.innerHTML = ""
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
                    
        </li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            let audio = element.querySelector(".info").firstElementChild.innerHTML.trim()
            playmusic(audio)
        })
    });
    return songs;
}
const playmusic = (track, pause = false) => {
    currentSong.src = `songs/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayalbums() {
    let a = await fetch(`songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let array = Array.from(as)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs/")) {
            let folder = e.href.split("/")[4]
            //get folder data
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json()
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img"
                        aria-hidden="true">
                        <!-- Background circle -->
                        <circle cx="24" cy="24" r="24" fill="#1ed760" />
                        <!-- Centered icon path (24x24 icon inside 48x48 canvas) -->
                        <g transform="translate(12,12)">
                            <path fill="black"
                                d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
                        </g>
                    </svg>
                    <img src="songs/${folder}/cover.jpg" alt="">
                    <h3>${response.title}</h3>
                    <p class="grey">${response.description}</p>
                </div>`
        }
    }
    //playlist event
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getsongs(`${e.dataset.folder}`)
            playmusic(songs[0])
            console.log(document.querySelector(".left").target)
            if (document.querySelector(".left").style.left == "-100%") {
                document.querySelector(".left").style.left = "0%"
                document.querySelector(".left").style.transition = "0.6s ease-out"
                document.querySelector(".hamburger").style.display = "none"
                document.querySelector(".close").style.display = "block"
                document.querySelector(".close").style.transition = "0.5s ease-out"
            }
        })
    })
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
        let index = songs.indexOf(currentSong.src.split("/")[5])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
        else {
            playmusic(songs[songs.length - 1])
        }

    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/")[5])
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