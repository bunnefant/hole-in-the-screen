class Text {
  constructor(props) {
    this.initialize(props)
  }
  
  animate() {
    if (arguments[0] instanceof Array) {
      let bigPromise = this._animateSingle(arguments[0][0]);
      for (let i = 1; i < arguments[0].length; i += 1) {
        bigPromise = bigPromise.then(() => this._animateSingle(arguments[0][i]));
      }
      return bigPromise;
    } else if (arguments instanceof Object) {
      return this._animateSingle(arguments[0]);
    }
  }
  
  _animateSingle(props) {
    const {
      color,
      size,
      duration
    } = props
    
    if (color) {
      this.text.style('color', color)
      this.text.style('transition', `color ${duration}s ease`);
    }
    
    if (size) {
      this.text.style('font-size', `${size}px`);
      this.text.style('transition', `font-size ${duration}s ease`);
    }
    
    return wait(1000 * duration);
  }
  
  initialize(props) {
    const {
      text,
      position,
      color,
      size
    } = props;
    
    this.text = createP(text);
    this.text.position(position.x, position.y);
    this.text.style('color', color);
    this.text.style('font-size', `${size}px`);
    this.text.style('margin', 0);
  }

  deleteText(){
    this.text.remove();
    return wait(1000);
  }
}

function createText(props) {
  return new Text(props);
}

// Thanks MDN!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
