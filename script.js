
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map ,mapEvent 

class Workout{
    date = new Date()
    id = (Date.now() + '').slice(-10)
    constructor(coords, distance, duration){
        this.coords = coords 
        this.distance = distance 
        this.duration = duration 
    }
    setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout{
    type = 'running'
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration)
        this.cadence = cadence
        this.calcPace()
        this.setDescription()
    }
    calcPace(){
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout{
    type = 'cycling'
    constructor(coords, distance, duration, elevation){
        super(coords, distance, duration)
        this.elevation = elevation
        this.calcSpeed()
        this.setDescription()
    }

    calcSpeed(){
        this.speed = this.distance / this.duration
        return this.speed
    }
}



class App{
    #map;
    #mapEvent;
    #workouts = []

    constructor(){
        this.getPosition()

        form.addEventListener('submit',this.newWorkOut.bind(this))
        
        inputType.addEventListener('change',function(){
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
        })
        containerWorkouts.addEventListener('click',this.movePopUp.bind(this))
    }
    getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this.loadMap.bind(this),function(){
                alert('sorry could not manage to find your location !')
            })
        
            
        }
    }
    loadMap(position){
    
                
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
            const cords = [latitude,longitude]
            this.#map = L.map('map').setView(cords, 13);
           
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    
    
        this.#map.on('click',this.showForm.bind(this))
        
        }
        newWorkOut(e){

            const validInputs = (...inputs) => inputs.every(inp=>Number.isFinite(inp))
            const allPositive = (...inputs) => inputs.every(inp=> inp>0)

            const type = inputType.value
            const distance = +inputDistance.value
            const duration = +inputDuration.value
            const {lat ,lng} = this.#mapEvent.latlng
            let workout

            if(type === 'running'){
                const cadence = +inputCadence.value

                if(!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert("inputs have to be positive numbers")

                workout = new Running([lat,lng],distance,duration,cadence)

                
            }
            if(type === 'cycling'){
                const elevation = +inputElevation.value

                if(!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert("inputs have to be positive numbers")
                
                workout = new Cycling([lat,lng],distance,duration,elevation)

            }
            

            this.#workouts.push(workout)
            console.log(workout)
            e.preventDefault()

            
            this.renderWorkoutMarker(workout)
            this.renderWorkOut(workout)
            this.hideForm()
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''

            
           
            
                
               
        }
        showForm(mapE){
            this.#mapEvent = mapE
            form.classList.remove('hidden')
            inputDistance.focus()
        }
        hideForm(){
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
            form.style.display = 'none'
            form.classList.add('hidden')
            setTimeout(()=>(form.style.display='grid'),1000)
        }
        renderWorkoutMarker(workout){
            L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth : 250,
                minWidth : 100,
                autoClose : false,
                closeOnClick : false,
                className : `${workout.type}-popup`
            })).setPopupContent(`${workout.type === 'running' ? '🏃‍♂️': '🚴‍♀️'} ${workout.description}`)
            .openPopup();
        }
        renderWorkOut(workout){

           let html = `
                <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️': '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
            `
        if(workout.type === 'running'){
          html +=  `
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
    `
        }
        if(workout.type === 'cycling'){
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
            `
        
        }
        form.insertAdjacentHTML('afterend', html)
        console.log("hello stupid")
       
        }
        movePopUp(e){
            const workoutE1 = e.target.closest('.workout')
            if(!workoutE1) return 

            const workout = this.#workouts.find(work => work.id === workoutE1.dataset.id)

            this.#map.setView(workout.coords,13)
        }

    
}

const app = new App()


