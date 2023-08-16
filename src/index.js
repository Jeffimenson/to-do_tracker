import { format, isToday, isThisWeek } from 'date-fns';
import './style.css';
import {make, query} from './jeffQuery.js';
import {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime} from './quests.js';

const body = query('body');

function stylizeDateFormat(date){
    return format(date, 'MM.dd.yy, hh:mm aa');
}

function getDateNow(){
    const d = new Date();
    return stylizeDateFormat(d);
}

class User {
    staticQuests = new StaticQuestGroup();
    dailyQuests = new DailyQuestGroup();
    weeklyQuests = new WeeklyQuestGroup();
    
    constructor() {}

}

const user = new User();


const display = (function(body){
    const main = make('main', body);
        const topBar = make('div.top-bar', main);
            const titleHolder = make('div.title-holder', topBar);
                const title = make('h1.title', titleHolder);
                title.textContent = "Quest Log";
            const date = make('div.date', topBar);
            date.textContent = "DATE HERE";

        const dataHolder = make('div.data-holder', main);
            const questSection = make('section.quests', dataHolder);
            const taskSection = make('section.tasks', dataHolder);

        const lowBar = make('div.low-bar', main);
            const nav = make('nav', lowBar);
                const pickStatic = make('button.static-quests', nav);
                pickStatic.textContent = "Static";

                const pickDaily = make('button.daily-quests', nav);
                pickDaily.textContent = "Daily";

                const pickWeekly = make('button.weekly-quests', nav);
                pickWeekly.textContent = "Weekly";

    
})(body);

