class SWProgressBar extends HTMLElement {
  static get observedAttributes () {
    return [];
  }

  constructor () {
    super();
    this.track = null;
    this.round = null;
    this.audio = null;

    this.onTimeUpdate = this.onTimeUpdate.bind(this);
  }

  connectedCallback () {
    this.track = this.querySelector('.progress-bar-presentation__track');
    this.round = this.querySelector('.progress-bar-presentation__round-container');
    this.audio = document.querySelector('audio');

    this.addEventListeners();
  }

  addEventListeners () {
    this.audio.addEventListener('timeupdate', this.onTimeUpdate);
  }

  onTimeUpdate (evt) {
    const {duration, currentTime} = evt.target;
    if (!duration) {
      return;
    }

    const position = currentTime / duration;
    requestAnimationFrame(() => this.update(position));
  }

  disconnectedCallback () {
    this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
  }

  update (position) {
    this.track.style.transform = `translate(0, -50%) scaleX(${position})`;
    this.round.style.transform = `translateX(${position * 100}%)`;
  }

  attributesChangedCallback (name, oldValue, newValue) {

  }
}

customElements.define('sw-progress-bar', SWProgressBar);