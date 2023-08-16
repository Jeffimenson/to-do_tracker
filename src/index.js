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

        const content = make('div.content', main);
            const leftSection = make('section.left', content);
                const questList = make('ul.quests', leftSection);
                for (let i = 0; i < 10; i++) { 
                    const entry = make('li', questList); 
                        const entryButton = make('button', entry);
                        entryButton.textContent = `Quest ${i}`;
                }
            const rightSection = make('section.right', content);
                const taskAdder = make('button.task-adder', rightSection);
                taskAdder.textContent = "+ Add task";
                
                const tasksContainer = make('div.tasks-container', rightSection);
                    const taskList = make('ul.tasks', tasksContainer);
                    for (let i = 0; i < 10; i++) { 
                        const entry = make('li', taskList); 
                        const entryLabel = make('label', entry);
                        entryLabel.textContent = `Perform activity ${i}`;
                        const entryInput = make('input', entryLabel);
                        entryInput.type = 'checkbox';
                        const customCheck = make('span.checkbox', entryLabel);


                    }



        const lowBar = make('div.low-bar', main);
            const nav = make('nav', lowBar);
                const pickStatic = make('button.static-quests', nav);
                pickStatic.textContent = "Static";

                const pickDaily = make('button.daily-quests', nav);
                pickDaily.textContent = "Daily";

                const pickWeekly = make('button.weekly-quests', nav);
                pickWeekly.textContent = "Weekly";

    
})(body);

