import { format } from 'date-fns';
import './style.css';
import {make, query} from './jeffQuery.js';
import {Task, Quest, QuestGroup} from './quests.js';

const body = query('body');

function getDateNow(){
    const d = new Date();
    return format(d, 'MM.dd.yy, hh:mm aa');
}

const clock = make('div', body);
setInterval(() => {
    clock.textContent = getDateNow(); 
}, 1000);



const task = new Task("Fart", false);
console.log(task);