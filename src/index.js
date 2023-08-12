import './style.css';
import {make} from './jeffQuery.js';

const body = document.querySelector('body');
const div = make('div', body);
div.textContent = "hello";
