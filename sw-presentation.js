class SWPresentation extends HTMLElement {
  static get observedAttributes () {
    return [];
  }

  constructor () {
    super();
    this.title = null;
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
      return;
    }

    this.title = this.querySelector('.presentation__title');
    this.artist = this.querySelector('.presentation__artist');
    this.album = this.querySelector('.presentation__album');
    this.artwork = this.querySelector('.presentation__artwork');
    this.currentTime = this.querySelector('.presentation__current-time');
    this.totalTime = this.querySelector('.presentation__total-time');

    this.audio = this.querySelector('audio');
    this.initPresentation();
    this.initShakaPlayer();
    
    this.addEventListeners();
  }

  addEventListeners () {
    this.audio.addEventListener('timeupdate', this.onTimeUpdate)
  }

  onTimeUpdate (evt) {
    const {currentTime} = evt.target;
    if (!evt.target.duration) {
      return;
    }

    this.currentTime.innerText = currentTime;
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

  initPresentation () {
    navigator.presentation.receiver.connectionList.then(list => {
      // the spec says to do that
      list.connections.map(connection => this.addConnection(connection));
      list.onconnectionavailable = evt => this.addConnection(evt.connection);
    }).catch(err => console.error(err));
  }

  initShakaPlayer () {
    // install shaka player polyfills
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported by shaka-player...');
      return;
    }

    this.player = new shaka.Player(this.audio);

    // listen to errors
    this.player.addEventListener('error', err => console.error(err));
  }

  /**
   * Stream an audio with DASH (thanks to shaka-player)
   * @param {String} manifest manifest url
   */
  listen (manifest) {
    return this.player.load(`${SWPresentation.CDN_URL}/${manifest}`).then(_ => {
      console.log(`[shaka-player] Music loaded: ${manifest}`);
      return this.audio.play();
    }).catch(err => {
      console.error(err);
    });
  }

  addConnection (connection) {
    connection.send('connected');

    connection.addEventListener('message', evt => {
      connection.send(event.data);

      const data = JSON.parse(evt.data);
      const {type} = data;

      if (type === 'song') {
        this.updateUI(data);
        this.listen(data.track.manifestURL);
        return;
      }

      if (type === 'playOrPause') {
        const {status} = data;
        if (status === 'play') {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      }

      if (type === 'seek') {
        this.audio.currentTime = data.currentTime;
        return;
      }

      if (type === 'volume') {
        this.audio.volume = data.volume;
        return;
      }
    });
  }

  updateUI (data) {
    const {artist, album, track, currentTime} = data;
    this.artwork.src = `${SWPresentation.CDN_URL}/${track.coverURL}`;
    this.title.innerText = track.title;
    this.artist.innerText = artist;
    this.album.innerText = album;
    this.currentTime.innerText = currentTime;
    this.totalTime.innerText = track.duration;
  }

  attributesChangedCallback (name, oldValue, newValue) {

  }
}

customElements.define('sw-presentation', SWPresentation);