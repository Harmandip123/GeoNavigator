'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; //[lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  clicking() {
    this.clicks++;
    console.log('number of clicks', this.clicks);
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

/////APPLICATION Architecture

class App {
  #MAP;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getPosition();

    // to Get data from Loacal Storage
    this._getLocalStorage();

    //jb form submit keya
    form.addEventListener('submit', this._newWorkout.bind(this)); //eventlistner function mai jo event listen function hota ha vo call as a normal function call hota hai so ham uske sath this bind ki through send karte hai

    //jb form mai option chnage kare
    inputType.addEventListener('change', this._toggleElevationFiled.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this)); // ye "this._moveToPopup" as a funtion call treate hoge to sath main 'bind(this)' attach karna hoga atke pta cha jaye object ka
  }

  _getPosition() {
    //geolocation is an browser API
    //getCurrentPosition() function takes 2 input parameter, first when function successfully get cordinates
    // second when there is an error in getting the cordinate
    if (navigator.geolocation) {
      //agar  broweser ka  navigator.geolocation chal raha hai tohi
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('We Could Not Get Your Position');
        }
      );
    }
  }
  //to load the map on current position of user
  _loadMap(position) {
    {
      console.log(position);
      const { latitude } = position.coords; //destructuring in objects use ki hai
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`); // google map ki link hai apne position dal di

      // we are using the third party library called leaflet to display map in our website
      // we are not downloading the leaflet we are just using the hoisted version of it meanig actually running on different server and we just use it
      //leaflet libraray mainse yea code uthaya
      // leaflet give us this L namspace jisse ham yea methods use kar rahi ahi like map(),tileLayer(),marker()

      const cordinates = [latitude, longitude];
      this.#MAP = L.map('map').setView(cordinates, 13); //"map" is the id name of the map and yaha apne cordinates bhi dal deye,zoom level bhi bta deya
      // ham map bhi chage kar sakte hai by doing some changes in tilelayer parameter
      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#MAP);

      //   L.marker(cordinates) // yaha apne cordinates bhi dal deye jaha marker bnana hai
      //     .addTo(MAP)
      //     .bindPopup('A pretty CSS popup.<br> Easily customizable.') //bindpopup mai jo likha hai vo marker pr lekha jata hai
      //     .openPopup();

      //ham yea chate hai ki ham map ki jis cordinate pr click kare vaha pr location mark ho jaye..pr hm yaha pr apna addeventlistner() method  nahi lga sakte because hamko locatiion nahi pta chale ge ki map pr kaha click keya
      // so ham leftlet library ka method  on()  use karege as eventlistner
      this.#MAP.on('click', this._showForm.bind(this));

      //reload the markers from localstorage
      this.#workout.forEach(work => {
        this._renderWorkoutMarker(work);
      });
    }
  }
  // jab map pr click keya
  _showForm(clickKiInfo) {
    this.#mapEvent = clickKiInfo;
    form.classList.remove('hidden'); //ab form show hone lag jaye
    inputDistance.focus();
  }
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }
  // switch b/w cycling and running
  _toggleElevationFiled() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // to check the data is valid and create an object for cycling or runing
  _newWorkout(e) {
    const ValidInput = function (...inputs) {
      return inputs.every(inp => Number.isFinite(inp));
    };
    const allpositive = function (...inputs) {
      return inputs.every(inp => inp > 0);
    };

    e.preventDefault();
    //Get data from form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // if workout is running, then creating runing object
    if (type === 'running') {
      const cadence = Number(inputCadence.value);
      //Check if data is valid
      if (
        !ValidInput(distance, duration, cadence) ||
        !allpositive(distance, duration, cadence)
      ) {
        return alert('inputs have to be Positive Numbers!');
      }

      //creating object
      workout = new Running([lat, lng], distance, duration, cadence);

      console.log('workout running', workout);
    }

    // if workout is cycling, then creating cycling object
    if (type === 'cycling') {
      const elevation = Number(inputElevation.value);
      //Check if data is valid
      if (
        !ValidInput(distance, duration, elevation) ||
        !allpositive(distance, duration)
      ) {
        return alert('inputs have to be Positive Numbers!');
      }
      // creting object
      workout = new Cycling([lat, lng], distance, duration, elevation);

      console.log('workout cycling', workout);
    }

    // Add new object to workout array
    this.#workout.push(workout);

    //to render  OBJECt workout  on map as marker
    this._renderWorkoutMarker(workout);

    //Add workout to list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    console.log(this.#mapEvent);

    // ham entire workout array ko browser ki local storage main save kar lenge take
    //  jab reload kare  to saree workout objects   local storage main save rahe and then we load all the workout from loacal storage and display workout om map and list
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords) // yaha apne cordinates bhi dal deye jaha marker bnana hai
      .addTo(this.#MAP)
      .bindPopup(
        L.popup({
          // yea sarre leaflet se properties dekhe hai for our Popup
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, //type depends ki running ya cycling
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      ) //content to write on marker
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }"
    >
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }
    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    //form ki baad html vala content ayega
    form.insertAdjacentHTML('afterend', html);
  }
  // jis form pr click kroge us mark pr map move kar jayega
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout'); //jis jgha user click kare uski near parent element jiski class "workout" hai vo miljaeyga
    if (!workoutEl) {
      return;
    }
    console.log(workoutEl.dataset);

    const clickedForm = this.#workout.find(
      // vo form ki  id mil jayege jaha click keya tha
      work => work.id === workoutEl.dataset.id
    );

    // setView leaflet library ka method hai
    // first parameter mai cordinates,second parameter mai zoom level,third kar nahi pta
    this.#MAP.setView(clickedForm.coords, 14, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // using the public interface
    clickedForm.clicking();
  }
  //store to local storagee
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workout)); // to convert object to string we use JSON.stringify
  }
  // restore from local storage
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts')); //JSON.parse is used to covert string to object
    console.log(data);

    if (!data) return;
    this.#workout = data;

    this.#workout.forEach(work => {
      this._renderWorkout(work);
    });
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

//object create
const app = new App();
