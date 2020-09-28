'use-strict';

const firebase = require('firebase');
const APP_BASE = 'https://proyectoprueba-e9130.firebaseio.com'

const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDbBbezuZ1QgRry43lelIjXCL617fFeOD4',
    authDomain: 'proyectoprueba-e9130.firebaseapp.com',
    databaseURL: APP_BASE,
    storageBucket: 'proyectoprueba-e9130.appspot.com',
};

export const Firebase = firebase.initializeApp(FIREBASE_CONFIG);