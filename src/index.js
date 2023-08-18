import { format, isToday, isThisWeek } from 'date-fns';
import './style.css';
import {make, query, toggleClass} from './jeffQuery.js';
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
for (let i = 0; i < randomInt(20, 5); i++){
    const tasks = [];
    for (let j = 0; j < randomInt(20, 5); j++){
        const task = new Task(`${randomVerbs[randomInt(randomVerbs.length)]} ${randomNouns[randomInt(randomNouns.length)]}`, false);
        tasks.push(task);
    }
    user.staticQuests.makeQuest(`Quests ${i}`, tasks);
}

// ...


const display = (function(body, user){
    let selectedQuestGroup = user.staticQuests; 
    let selectedQuestIndex;


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
                    const questPrompt = make('div.quest-prompt', questContainer);
                        const questPromptTop = make('div.quest-prompt-top', questPrompt);
                        const questPromptBody = make('div.quest-prompt-body', questPrompt);
                            const questNameLabel = make("label", questPromptBody);

                            const questNameInput = make('input#get-quest-name', questPromptBody);
                            questNameInput.setAttribute("type", "text");
                            questNameInput.setAttribute("placeholder", "Name here");

                            questNameLabel.setAttribute("for", "get-quest-name");
                            questNameLabel.textContent = "Quest name: "
                            
                            const submitQuest = make('button#submit-quest', questPromptBody);
                            submitQuest.textContent = "Ok";
                            


                        const questPromptLow = make('div.quest-prompt-low', questPrompt);

                    const questList = make('ul.quests', questContainer);


                const questAdder = make('button.quest-adder', leftSection);
                questAdder.textContent = "+";
                questAdder.addEventListener('click', onAddQuest);

            const rightSection = make('section.right', content);
                const taskAdder = make('button.task-adder', rightSection);
                taskAdder.textContent = "+ Add task";
                taskAdder.addEventListener('click', onAddTask);
                
                const tasksContainer = make('div.tasks-container', rightSection);
                    const taskList = make('ul.tasks', tasksContainer);

        const lowBar = make('div.low-bar', main);
            const nav = make('nav', lowBar);
                const pickStatic = make('button.static-quests', nav);
                pickStatic.textContent = "Static";
                pickStatic.addEventListener('click', onQuestGroupSelect.bind(null, user.staticQuests));

                const pickDaily = make('button.daily-quests', nav);
                pickDaily.textContent = "Daily";
                pickDaily.addEventListener('click', onQuestGroupSelect.bind(null, user.dailyQuests));

                const pickWeekly = make('button.weekly-quests', nav);
                pickWeekly.textContent = "Weekly";
                pickWeekly.addEventListener('click', onQuestGroupSelect.bind(null, user.weeklyQuests));
    // ...

    loadSelectedQuestGroup();

    function clearDisplayedTasks(){
        taskList.textContent = "";
    }

    function onQuestGroupSelect(questGroup){
        selectedQuestGroup = questGroup;
        
        loadSelectedQuestGroup();
        
        clearDisplayedTasks();

        const firstQuest = selectedQuestGroup.quests[0];
        if (firstQuest){
            const associatedEntry = query("[data-index='0']", questList);
            reassignSelectionStyle(associatedEntry);
            selectedQuestIndex = 0; 
            loadSelectedQuest();
        }
    }

    function loadSelectedQuestGroup(){
        const quests = selectedQuestGroup.quests;
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
        reassignSelectionStyle(this);

        const index = this.dataset.index;
        selectedQuestIndex = index; 

        loadSelectedQuest();
    }

    function reassignSelectionStyle(newSelected){
        const lastSelected = query(".selected", questList);
        if (lastSelected) lastSelected.classList.remove("selected");
        newSelected.classList.add("selected");

    }


    function loadSelectedQuest(){
        const quest = selectedQuestGroup.quests[selectedQuestIndex];
        taskList.textContent = "";
        for (let i = 0; i < quest.tasks.length; i++){
            const entry = make('li', taskList); 
            const entryLabel = make('label', entry);

            const task = quest.tasks[i];
            entryLabel.textContent = task.description;
            const entryInput = make('input', entryLabel);
            entryInput.type = 'checkbox';
            // entryLabel.setAttribute("tabIndex", `${entryInput.tabIndex}`);
            // entryInput.setAttribute("tabIndex", "-1");
            const customCheck = make('span.checkbox', entryLabel);
        }

    }

    function onAddQuest(){
        toggleClass(this, "selected");
        toggleClass(questPrompt, "activated");

        // selectedQuestGroup.makeQuest("Added quest", []);
        // loadSelectedQuestGroup();

        // selectedQuestIndex = 0;
        // const associatedEntry = query(`[data-index='0']`, questList);
        // reassignSelectionStyle(associatedEntry);
        // loadSelectedQuest();
    }

    
    function onAddTask(){
        const task = new Task("Cool new thing to do", false);
        selectedQuestGroup.quests[selectedQuestIndex].addTask(task);
        loadSelectedQuest();
    }

})(body, user);

