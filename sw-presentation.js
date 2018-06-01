class SWPresentation extends HTMLElement {
  static get observedAttributes () {
    return [];
  }

  constructor () {
    super();
    this.trackTitle = null;
    this.artist = null;
    this.album = null;
    this.artwork = null;
    this.currentTime = null;
    this.totalTime = null;

    this.audio = null;
    this.player = null;

    this.onTimeUpdate = this.onTimeUpdate.bind(this);
  }

  static get CDN_URL () {
    return 'https://cdn.streamwave.be';
  }

  connectedCallback () {
    if (!navigator.presentation.receiver) {
      console.warn('Presentation page not opened through Presentation API !');
      //return;
    }

    this.trackTitle = this.querySelector('.presentation__title');
    this.artist = this.querySelector('.presentation__artist');
    this.album = this.querySelector('.presentation__album');
    this.artwork = this.querySelector('.presentation__artwork');
    this.currentTime = this.querySelector('.presentation__current-time');
    this.totalTime = this.querySelector('.presentation__total-time');
    this.idle = this.querySelector('.idle');
    this.audio = this.querySelector('audio');

    console.log(this.querySelector('.presentation__title'), this);

    this.initShakaReceiver();
    this.addEventListeners();
    // this.updateUI({
    //   artist: 'Big Ty',
    //   album: 'Tem',
    //   title: 'Lève toi',
    //   coverURL: 'https://cdn.streamwave.be/tem/tem.jpg',
    //   currentTime: 0,
    //   duration: 200
    // });
  }

  addEventListeners () {
    this.audio.addEventListener('timeupdate', this.onTimeUpdate)
  }

  onTimeUpdate (evt) {
    const {currentTime} = evt.target;
    if (!evt.target.duration) {
      return;
    }

    this.currentTime.innerText = this.formatDuration(currentTime);
  }

  disconnectedCallback () {
    this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
  }

  formatDuration (duration) {
    const min = Math.floor(duration / 60);
    let sec = Math.floor(duration % 60);
    sec = sec < 10 ? "0" + sec : sec;
    return `${min}:${sec}`;
  }

  initShakaReceiver () {
    // install shaka player polyfills
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported by shaka-player...');
      return;
    }

    this.player = new shaka.Player(this.audio);
    this.receiver =  new shaka.cast.CastReceiver(this.audio, this.player, this.metadataCallback);

    this.receiver.addEventListener('caststatuschanged', this.checkIdle);

    // listen to errors
    this.player.addEventListener('error', err => console.error(err));
  }

  // handle metadata passed from the sender 
  metadataCallback (data) {
    // no data if receiver start without media loaded
    if (!data) {
      return;
    }

    const metadatas = data.asset;
    this.updateUI(data.asset);
  }

  checkIdle () {
    const idle = this.receiver.isIdle();
    if (idle) {
      this.idle.classList.add('idle--visible');
    } else {
      this.idle.classList.remove('idle--visible');
    }
  }

  updateUI (data) {
    const {artist, album, title, coverURL, currentTime, duration} = data;
    this.artist.innerText = artist;
    this.album.innerText = album;
    this.trackTitle.innerText = title;
    this.artwork.src = coverURL;
    this.currentTime.innerText = this.formatDuration(currentTime);
    this.totalTime.innerText = this.formatDuration(duration);
  }

  attributesChangedCallback (name, oldValue, newValue) {

  }
}

customElements.define('sw-presentation', SWPresentation);