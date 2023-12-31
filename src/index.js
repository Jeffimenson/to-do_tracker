import './style.css';
import DisplayManager from './DisplayManager';
import { format, isToday, isThisWeek, parse, isSameWeek, isSameDay} from 'date-fns';
import {make, query, toggleClass} from './jeffQuery.js';
import {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime} from './quests.js';

// Date formating functions
function formatFullDate(date){
    return format(date, 'MM.dd.yy, hh:mm:ss aa');
}
// ...

// date handling 
const dateDisplay = query('.date');
const currDate = new Date();
setInterval(() => {
    currDate.setSeconds(currDate.getSeconds() + 1);
    dateDisplay.textContent = formatFullDate(currDate);

}, 1000);

// ... 

const localStorage = window.localStorage;

class User {
    questGroups;
    
    constructor(staticQuests, dailyQuests, weeklyQuests) {

        this.questGroups = {
            stat: new StaticQuestGroup(staticQuests),
            daily: new DailyQuestGroup(dailyQuests),
            weekly: new WeeklyQuestGroup(weeklyQuests),
        }
    }
}

const QG = {
    static: "stat", 
    daily: "daily",
    weekly: "weekly"
};

function retrieveUserData() {
    const qgs = {}
    let userData; 
    if (localStorage.getItem("user")) {
        userData = JSON.parse(localStorage.getItem("user"));
    } else {
        return new User(); 
    }
    
    for (const [key, questArr] of Object.entries(userData)) {
        const thickQuests = [];
        for (let i = 0; i < questArr.length; i++) {
            const flatQuest = questArr[i];

            const thickTasks = [];
            for (let j = 0; j < flatQuest.tasks.length; j++) {
                const flatTask = flatQuest.tasks[j];
                const compDate = (flatTask.completionDate) ? new Date(parseInt(flatTask.completionDate)) : null;
                const task = new Task(flatTask.description, flatTask.isOptional, compDate);
                thickTasks.push(task);
            }

            const due = (flatQuest.dueDate) ? new Date(parseInt(flatQuest.dueDate)) : null;
            const compDate = (flatQuest.completionDate) ? new Date(parseInt(flatQuest.completionDate)) : null;

            const thickQuest = new Quest(flatQuest.name, thickTasks, due, compDate);
            thickQuests.push(thickQuest);
        }

        qgs[key] = thickQuests;
    }

    const newUser = new User(qgs.stat, qgs.daily, qgs.weekly);
    return newUser;
}

// test code
function createTestQuests(user) {
    const randomInt = (max, min=0) => Math.floor(Math.random() * (max-min) + min);

    const randomVerbs = ["poop", "fart", "piss", "sleep", "eat", "drink", "kill", "punch", "kick", "stalk"];
    const randomNouns = ["lamp", "turtle", "phone", "television", "radio", "table", "bed", "girl", "boy", "water", "poo poo", "pee pee"];
    for (let i = 0; i < randomInt(5, 4); i++) {
        const tasks = [];
        for (let j = 0; j < randomInt(5, 2); j++) {
            const task = new Task(`${randomVerbs[randomInt(randomVerbs.length)]} ${randomNouns[randomInt(randomNouns.length)]}`, false);
            tasks.push(task);
        }
        user.questGroups.stat.makeQuest(`Quests ${i}`, tasks);
    }
}


const today = new Date();

// NEW Dom generation code
const body = query('body');
const leftSection = body.querySelector('section.left');
const rightSection = body.querySelector('section.right');
const nav = body.querySelector('nav');

// localStorage.clear();
const user = retrieveUserData();
// user.questGroups.daily.resetQuests();
// createTestQuests(user);


let lastSaveDate = localStorage.getItem("last-save-date");
lastSaveDate = (lastSaveDate) ? new Date(parseInt(lastSaveDate)) : null; 

if (!isSameWeek(today, lastSaveDate)) {
    user.questGroups.weekly.resetQuests();
}
if (!isSameDay(today, lastSaveDate)) {
    user.questGroups.daily.resetQuests();
}


const DM = new DisplayManager(user, nav, rightSection, leftSection); 
DM.displayQuestGroup(QG.static);


