import { format, min } from 'date-fns';
import './style.css';
import {make, query} from './jeffQuery.js';
import {Task, Quest, QuestGroup} from './quests.js';

const body = query('body');

function getDateNow(){
    const d = new Date();
    return format(d, 'MM.dd.yy, HH:mm');
}

const clock = make('div', body);
setInterval(() => {
    clock.textContent = getDateNow(); 
}, 1000);

function Time(hours, minutes){
    return {
        hours, 
        minutes
    }
}

class User {
    staticQuests = new QuestGroup();
    dailyQuests = new QuestGroup();
    weeklyQuests = new QuestGroup();
    
    constructor() {}

    makeStaticQuest(name, tasks, due){
        const qst = new Quest(name, tasks, due);
        this.staticQuests.addQuest(qst);
    }

    makeDailyQuest(name, tasks, time){
        const date = new Date();
        date.setHours(time.hours, time.minutes);
        const qst = new Quest(name, tasks, date);
        this.dailyQuests.addQuest(qst);
    }

}


const user = new User();
user.makeStaticQuest("Poopy boy", [], new Date());
user.makeDailyQuest("Fart man", [], Time(16, 3));
console.log(user);