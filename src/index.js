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

//test code
function randomInt(max, min=0) {return Math.floor(Math.random() * (max-min) + min);}
const randomVerbs = ["poop", "fart", "piss", "sleep", "eat", "drink", "kill", "punch", "kick", "stalk"];
const randomNouns = ["lamp", "turtle", "phone", "television", "radio", "table", "bed", "girl", "boy", "water", "poo poo", "pee pee"];
const testTasks = [new Task("Eat", false), new Task("Sleep", false), new Task("Game", false)];
for (let i = 0; i < randomInt(20, 5); i++){
    const tasks = [];
    for (let j = 0; j < randomInt(20, 5); j++){
        const task = new Task(`${randomVerbs[randomInt(randomVerbs.length)]} ${randomNouns[randomInt(randomNouns.length)]}`, false);
        tasks.push(task);
    }
    user.staticQuests.makeQuest(`Quests ${i}`, tasks, testTasks);
}
// ...


const display = (function(body, user){
    let selectedQuestGroup = user.staticQuests; 

    // Dom generation code
    const main = make('main', body);
        const topBar = make('div.top-bar', main);
            const titleHolder = make('div.title-holder', topBar);
                const title = make('h1.title', titleHolder);
                title.textContent = "Quest Log";
            const date = make('div.date', topBar);
            date.textContent = "DATE HERE";

        const content = make('div.content', main);
            const leftSection = make('section.left', content);
                const questContainer = make('div.quest-container', leftSection);
                    const questList = make('ul.quests', questContainer);
                    // for (let i = 0; i < 10; i++) { 
                    //     const entry = make('li', questList); 
                    //         const entryButton = make('button', entry);
                    //         entryButton.textContent = `Quest ${i}`;
                    //         entryButton.addEventListener('click', questSelect);
                    // }
                const questAdder = make('button.quest-adder', leftSection);
                questAdder.textContent = "+";

            const rightSection = make('section.right', content);
                const taskAdder = make('button.task-adder', rightSection);
                taskAdder.textContent = "+ Add task";
                
                const tasksContainer = make('div.tasks-container', rightSection);
                    const taskList = make('ul.tasks', tasksContainer);
                    // for (let i = 0; i < 10; i++) { 
                    //     const entry = make('li', taskList); 
                    //     const entryLabel = make('label', entry);
                    //     entryLabel.textContent = `Perform activity ${i}`;
                    //     const entryInput = make('input', entryLabel);
                    //     entryInput.type = 'checkbox';
                    //     const customCheck = make('span.checkbox', entryLabel);

                    // }

        const lowBar = make('div.low-bar', main);
            const nav = make('nav', lowBar);
                const pickStatic = make('button.static-quests', nav);
                pickStatic.textContent = "Static";
                pickStatic.addEventListener('click', onQuestGroupSelect.bind(null, user.staticQuests));

                const pickDaily = make('button.daily-quests', nav);
                pickDaily.textContent = "Daily";
                pickDaily.addEventListener('click', onQuestGroupSelect.bind(null, user.staticQuests));

                const pickWeekly = make('button.weekly-quests', nav);
                pickWeekly.textContent = "Weekly";
                pickWeekly.addEventListener('click', onQuestGroupSelect.bind(null, user.staticQuests));
    // ...

    function onQuestGroupSelect(questGroup){
        selectedQuestGroup = questGroup;
        
        const quests = questGroup.quests;
        questList.textContent = "";
        for (let i = 0; i < quests.length; i++){
            const entry = make('li', questList); 
                const entryButton = make('button', entry);
                entryButton.textContent = quests[i].name; 
                entryButton.dataset.index = i;
                entryButton.addEventListener('click', questSelect);
        }
    }

    function questSelect(){
        const lastSelected = query(".selected", questList);
        if (lastSelected) lastSelected.classList.remove("selected");
        this.classList.add("selected");

        const index = this.dataset.index;
        const quest = selectedQuestGroup.quests[index];

        taskList.textContent = "";
        for (let i = 0; i < quest.tasks.length; i++){
            const entry = make('li', taskList); 
            const entryLabel = make('label', entry);

            const task = quest.tasks[i];
            entryLabel.textContent = task.description;
            const entryInput = make('input', entryLabel);
            entryInput.type = 'checkbox';
            const customCheck = make('span.checkbox', entryLabel);
        }
    }

})(body, user);

