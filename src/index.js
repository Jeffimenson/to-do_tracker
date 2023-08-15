import { format, isToday, isThisWeek } from 'date-fns';
import './style.css';
import {make, query} from './jeffQuery.js';
import {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime} from './quests.js';

const body = query('body');

function stylizeDateFormat(date){
    format(date, 'MM.dd.yy, HH:mm')
}

function getDateNow(){
    const d = new Date();
    return stylizeDateFormat(d);
}

const clock = make('div', body);
setInterval(() => {
    clock.textContent = getDateNow(); 
}, 1000);


class User {
    staticQuests = new StaticQuestGroup();
    dailyQuests = new DailyQuestGroup();
    weeklyQuests = new WeeklyQuestGroup();
    
    constructor() {}

}


const user = new User();
user.staticQuests.makeQuest("Poopy boy", [], new Date());
user.dailyQuests.makeQuest("Fart man", [], DailyTime(16, 3));
user.weeklyQuests.makeQuest("Dinodisaster", [], WeeklyTime(Day.Mon, 22, 0));

user.dailyQuests.resetQuests();
console.log(user);


