/* eslint func-names: 0,  no-unused-vars: 0, no-alert: 0, class-methods-use-this: 0 , no-plusplus: 0 , indend: 0 , no-restricted-syntax: 0 , no-use-before-define: 0 , no-loop-func: 0, func-names: 0, space-before-blocks: 0, indent: 0, max-len: 0 */
// The comments above are just to remove error messages from my VS Code

window.onload = function (evt) {
  // CHARACTER CLASS, USED FOR OUR POKEMON
  class Character {
    constructor(characterName, pic, gif, stats, abilities) {
      this.name = characterName;
      this.pic = pic;
      this.gif = gif;
      this.stats = stats;
      this.abilities = abilities;
    }
    // function goes to the api and gets a pokemon object, by its name
    // returns a promise for the object, instead of the actual object
    getCharacterPromise(characterName) {
      const endpoint = characterName || this.name;
      // this function will return a promise:
      return new Promise((resolve, reject) => {
        // create a new request object:
        const xhr = new XMLHttpRequest();
        // format the request object, to get it ready to send:
        xhr.open('GET', `${this.apiURL}/${endpoint}/`);
        // send that thing:
        xhr.send();
        // this is an event-listener.  When the 'onload'event fires, it means that there
        // has been a successful response:
        xhr.onload = function () {
          // notice that we are wrapping the data in the 'resolve' function, and this is the name of the parameter on line 19
          resolve(JSON.parse(xhr.responseText));
        };
        // this is an event-listener.  When the 'onerror' event fires, it means that there
        // the response is an error
        xhr.onerror = function () {
          // notice that we are wrapping the data in the 'reject' function, and this is the name of the parameter on line 19
          reject(xhr.statusText);
        };
      });
    }
    makeCharacterInstance(characterObject) {
      // take all of the data in the object that the a.p.i. returns
      // and extract it in a way that allows us to neatly pass it to
      // our constructor function:
      const characterName = characterObject.name;
      // This reduce thing can make you dizzy when you first look at it.  Will go over it with you.
      const reformattedStats = characterObject.stats.reduce((reformatted, stat) => {
        reformatted[stat.stat.name] = stat.base_stat;
        return reformatted;
      }, {});
      const reformattedAbilities = characterObject.abilities.reduce((arr, ability, index) => {
        arr[index] = ability.ability.name;
        return arr;
      }, []);
      const defaultPic = characterObject.sprites.front_default;
      // if our hash of gifs, contains a gif for this character, add it:
      // if not, store it as a 'null' value
      const gif = Character.prototype.gifs[characterName] || null;
      // create an instance of a Character constructor function/ class, and return it.
      return new Character(characterName, defaultPic, gif, reformattedStats, reformattedAbilities);
    }
  }
  Character.prototype.apiURL = 'https://pokeapi.co/api/v2/pokemon';
  // since we are adding external gifs, we will store whichever gifs we are able to find here:
  // #NOTE: paste the gif you want to use for your characters here:
  Character.prototype.gifs = {
    weezing: 'add gif',
    oddish: 'add gif',
    gloom: 'add gif',
    dragonair: 'http://www.pokestadium.com/sprites/xy/dragonair-2.gif',
    butterfree:
      'http://rs744.pbsrc.com/albums/xx87/jessstaardust/tumblr_n1234ahMHc1s2qnyjo1_250_zpsa8f9c122.gif~c200',
    charmeleon:
      'https://orig00.deviantart.net/5293/f/2016/030/b/7/charmeleon_gif_by_queenaries-d9px7h5.gif',
  };

  class Player {
    constructor(playerName, charactersArray) {
      this.name = playerName;
      this.gym = {};
      this.characters = charactersArray;
    }
    // I think we can remove the 'loadGym function, because we now have the 'loadGymPromise' function:
    loadGym(arrayOfCharacters) {
      const charactersArray = this.characters || arrayOfCharacters;
      const arrayOfPromises = [];
      for (let i = 0; i < charactersArray.length; i++) {
        const characterName = charactersArray[i];
        const promise = Character.prototype.getCharacterPromise(characterName);
        arrayOfPromises[i] = promise;
      }
      Promise.all(arrayOfPromises)
        .then((arrayOfCharacterObjects) => {
          arrayOfCharacterObjects.forEach((characterObject) => {
            this.gym[characterObject.name] = characterObject;
          });
          console.log(`${this.name}'s gym: `, this.gym);
        })
        .catch((err) => {
          console.log(`error caught in the loadGym promise chain: ${err}`);
        });
    }
    // made load gym a promise too, so that we can do things after the gyms are loaded:
    loadGymPromise(arrayOfCharacters) {
      const charactersArray = this.characters || arrayOfCharacters;

      return new Promise((resolve, reject) => {
        const arrayOfPromises = [];
        for (let i = 0; i < charactersArray.length; i++) {
          const characterName = charactersArray[i];
          const promise = Character.prototype.getCharacterPromise(characterName);
          arrayOfPromises[i] = promise;
        }
        Promise.all(arrayOfPromises)
          .then((arrayOfCharacterObjects) => {
            arrayOfCharacterObjects.forEach((characterObject) => {
              this.gym[characterObject.name] = characterObject;
            });
            // console.log(`${this.name}'s gym: `, this.gym);
            resolve(this.gym);
          })
          .catch((err) => {
            // console.log(`error caught in the loadGym promise chain: ${err}`);
            reject(err);
          });
      });
    }
  }

  // here we create our player instances, and pass an array of our pokemon names:
  const professorDoom = new Player('Professor Doom', ['weezing', 'oddish', 'gloom']);
  const chuck = new Player('Chuck', ['dragonair', 'butterfree', 'charmeleon']);

  // promise chain to load both player's gym:
  chuck
    .loadGymPromise() // loading Chuck's gym
    .then((gym) => {
      console.log('chucks gym:', gym);
      return professorDoom.loadGymPromise(); // loading Professor Doom's gym
    })
    .then((gym) => {
      console.log('professor dooms gym:', gym);

      // #NOTE-01:  right here, is where we need to make the page active, because the Pokemon have all arrived and are in their trainer's gym
      // Make all spinning icons in the html have an initial opacity of 0.5 or something?
      // In this part of the javascript, add a class to the icons that makes their opacity fade up and they start spinning?
    })
    .catch((err) => {
      console.log(`error caught in loadGymPromise chain: ${err}`);
    });

  // #NOTE:
  // After all of the above code has run, the page should now appear active (from the visual cues made at #NOTE-01)
  // CODE FOR MANIPULATING AND RENDERING TO THE DOM:
  // later, these functions can be added to a Display class

  // select the spinning icons and add an 'click' event-listener to them:
  /*
  const dragonairButton = document.getElementById('   ');
  const butterfreeButton = document.getElementById('   ');
  const charmeleonButton = document.getElementById('   ');
  const weezingButton = document.getElementById('   ');
  const oddishButton = document.getElementById('   ');
  const gloomButton = document.getElementById('   ');

  //example:
  dragonairButton.addEventListener('click', function() {
        //remove whatever is in the display:
        //add dragonair
  });
  */
};
