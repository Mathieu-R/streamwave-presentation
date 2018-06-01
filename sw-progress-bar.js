class SWProgressBar extends HTMLElement {
  static get observedAttributes () {
    return [];
  }

  constructor () {
    super();
    this.track = null;
    this.round = null;
    this.audio = null;

    this.update = this.update.bind(this);
  }

  connectedCallback () {
    this.track = this.querySelector('.progress-bar-presentation__track');
    this.round = this.querySelector('.progress-bar-presentation__round-container');
    this.audio = document.querySelector('audio');

    requestAnimationFrame(this.update);
  }

  update () {
    requestAnimationFrame(this.update);
    
    const {duration, currentTime} = this.audio;
    if (!duration) {
      return;
    }

    const position = currentTime / duration;

    this.track.style.transform = `translate(0, -50%) scaleX(${position})`;
    this.round.style.transform = `translateX(${position * 100}%)`;
  }

  attributesChangedCallback (name, oldValue, newValue) {

  }
}

customElements.define('sw-progress-bar', SWProgressBar);