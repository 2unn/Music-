const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "2un";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "An thần",
      singer: "",
      path: "./music/song1.mp3",
      image: "./img/song1.jpg",
    },
    {
      name: "In My Feeling",
      singer: "Drake",
      path: "./music/song2.mp3",
      image: "./img/song2.jpg",
    },
    {
      name: "Hotline Bling",
      singer: "Drake",
      path: "./music/song3.mp3",
      image: "./img/song3.jpg",
    },
    {
      name: "Có thể là tại sao",
      singer: "Vũ",
      path: "./music/song4.mp3",
      image: "./img/song4.jpg",
    },
    {
      name: "Cypher nhà làm",
      singer: "Low g",
      path: "./music/song5.mp3",
      image: "./img/song5.jpg",
    },
    {
      name: "Đông kiếm em",
      singer: "Vũ",
      path: "./music/song6.mp3",
      image: "./img/song6.jpg",
    },
    {
      name: "Em gái",
      singer: "Low g",
      path: "./music/song7.mp3",
      image: "./img/song7.jpg",
    },
    {
      name: "Hành tinh song song",
      singer: "Vũ",
      path: "./music/song8.mp3",
      image: "./img/song8.jpg",
    },
    {
      name: "LyliHammer",
      singer: "Robber",
      path: "./music/song9.mp3",
      image: "./img/song9.jpg",
    },
    {
      name: "Mùa mưa ngâu nằm cạnh",
      singer: "Vũ",
      path: "./music/song10.mp3",
      image: "./img/song10.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
            <div class="song ${
              index === this.currentIndex ? "active" : ""
            }" data-index = "${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handerEvent: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //Xử lý CD quay
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    //Xử lý phóng to thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lý khi click play button
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi play audio
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi pause audio
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //Khi tiến độ audio thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercen = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercen;
      }
    };

    //Xử lí tua
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Xử lí Random
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //Xử lí loop song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //Xử lí next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode && !e.target.closest(".option")) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        audio.play();
        _this.render();
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 200);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    document.getElementsByTagName(
      "body"
    )[0].style.backgroundImage = `url('${this.currentSong.image}')`;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    //Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    //Định nghĩa các thuộc tính cho object
    this.defineProperties();

    //Lắng nghe / xử lý các sự kiện (DOM events)
    this.handerEvent();

    //Tải thông tin bài hát đầu tiên vào UI
    this.loadCurrentSong();

    //Render playlist
    this.render();

    //Hiển thị trạng thái ban đầu của  btn Repeat va Random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
