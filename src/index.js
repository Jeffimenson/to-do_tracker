import './style.css';
import DisplayManager from './DisplayManager';
import { format, isToday, isThisWeek } from 'date-fns';
import {make, query, toggleClass} from './jeffQuery.js';
import {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime} from './quests.js';

// Date formating functions
function formatFullDate(date){
    return format(date, 'MM.dd.yy, hh:mm aa');
}
// ...

class User {
    questGroups;
    
    constructor() {


        this.questGroups = {
            stat: new StaticQuestGroup(),
            daily: new DailyQuestGroup(),
            weekly: new WeeklyQuestGroup(),
        }
    }
}

const user = new User();

// test code
// const randomInt = (max, min=0) => Math.floor(Math.random() * (max-min) + min);

// const randomVerbs = ["poop", "fart", "piss", "sleep", "eat", "drink", "kill", "punch", "kick", "stalk"];
// const randomNouns = ["lamp", "turtle", "phone", "television", "radio", "table", "bed", "girl", "boy", "water", "poo poo", "pee pee"];
// for (let i = 0; i < randomInt(5, 4); i++) {
//     const tasks = [];
//     for (let j = 0; j < randomInt(5, 2); j++) {
//         const task = new Task(`${randomVerbs[randomInt(randomVerbs.length)]} ${randomNouns[randomInt(randomNouns.length)]}`, false);
//         tasks.push(task);
//     }
//     user.questGroups.stat.makeQuest(`Quests ${i}`, tasks);
// }
// ...

const body = query('body');

const QG = {
    static: "stat", 
    daily: "daily",
    weekly: "weekly"
}

// NEW Dom generation code
const leftSection = body.querySelector('section.left');
const rightSection = body.querySelector('section.right');
const nav = body.querySelector('nav');

const DM = new DisplayManager(user, nav, rightSection, leftSection); 
DM.displayQuestGroup(QG.static);