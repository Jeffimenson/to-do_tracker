import { format, isToday, isThisWeek } from 'date-fns';
import './style.css';
import {make, query} from './jeffQuery.js';
import {Task, Quest, QuestGroup} from './quests.js';

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

function DailyTime(hour, minute){
    return {
        hour, 
        minute
    }
}

const Day = {
    Sun: 0,
    Mon: 1,
    Tue: 2, 
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
};

function WeeklyTime(day, hour, minute){
    return {
        day, 
        hour,
        minute
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
        date.setHours(time.hour, time.minute, 0);

        const qst = new Quest(name, tasks, date);
        this.dailyQuests.addQuest(qst);
    }

    resetDailyQuests(){
        for (let i = 0; i < this.dailyQuests.quests.length; i++){
            const currQuest = this.dailyQuests.getQuest(i);
            const dueTime = currQuest.dueDate;
            const newTime = new Date();
            newTime.setHours(dueTime.getHours(), dueTime.getMinutes());

            currQuest.dueDate = newTime;

            if (currQuest.completionDate !== null) currQuest.resetCompletionDate();
        }
    }

    makeWeeklyQuest(name, tasks, weeklyTime){
        const date = new Date();

        const dayDiff = date.getDay() - weeklyTime.day; 
        const dayOfMonth = date.getDate() - dayDiff; 
        date.setDate(dayOfMonth);

        date.setHours(weeklyTime.hour, weeklyTime.minute, 0);
        
        const qst = new Quest(name, tasks, date);
        this.weeklyQuests.addQuest(qst);
    }

    resetWeeklyQuests(){
    }

}


const user = new User();
user.makeStaticQuest("Poopy boy", [], new Date());
user.makeDailyQuest("Fart man", [], DailyTime(16, 3));
user.makeWeeklyQuest("Dinodisaster", [], WeeklyTime(Day.Mon, 22, 0));

user.resetDailyQuests();


