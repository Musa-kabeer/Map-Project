'use strict';

// WORKOUT
class Workout {
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescribtion() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

// RUNNING
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this._setDescribtion();
    this.calcPace();

    this.cadence = cadence;
  }

  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

// CYCLING
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this._setDescribtion();
    this.calcSpeed();

    this.elevation = elevation;
  }

  calcSpeed() {
    this.speed = this.duration / (this.distance / 60);
  }
}

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// APPLICATION
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getCurrentPosition();

    form.addEventListener('submit', this._newWorkOut.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Network Problem');
        }
      );
    }
  }

  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // SHOW FORM
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _newWorkOut(e) {
    e.preventDefault();

    const validInput = (...inputs) => {
      return inputs.every(input => Number.isFinite(input));
    };

    const minimumNumber = (...inputs) => {
      return inputs.every(input => input > 0);
    };

    // GET DATA FROM FORM INPUTS
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // RUNNING
    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (!validInput(distance, duration, cadence)) {
        alert('Input have to be numbers');
      }

      if (!minimumNumber(distance, duration, cadence))
        alert('Number must be positive!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // CYCLING
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (!validInput(distance, duration, elevation)) {
        alert('Input have to be numbers');
      }

      if (!minimumNumber(distance, duration, elevation))
        alert('Number must be positive!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);

    this._renderWorkOutMark(workout);

    // console.log(this.#workouts);
    this._renderWorkout(workout);

    // HIDE FORM
    this._hideForm();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _renderWorkOutMark(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 400,
          minWidth: 300,
          autoPan: true,
          autoClose: false,
          closeOnClick: false,
          className: `${
            workout.type === 'running' ? 'running-popup' : 'cycling-popup'
          }`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="1234567890">
          <h2 class="workout__title">${workout.type} on April 14</h2>
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
          </div>
    `;
    if (workout.type === 'running') {
      html += `
         <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div> 
        </li>
      
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _hideForm() {
    form.classList.add('hidden');
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
}
const app = new App();
