import { format, isToday, isThisWeek } from 'date-fns';
import './style.css';
import {make, query, toggleClass} from './jeffQuery.js';
import {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime} from './quests.js';

const body = query('body');

function formatFullDate(date){
    return format(date, 'MM.dd.yy, hh:mm aa');
}

function formateDate(date){
    return format(date, 'MM.dd.yy');
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

const randomInt = (max, min=0) => Math.floor(Math.random() * (max-min) + min);

const randomVerbs = ["poop", "fart", "piss", "sleep", "eat", "drink", "kill", "punch", "kick", "stalk"];
const randomNouns = ["lamp", "turtle", "phone", "television", "radio", "table", "bed", "girl", "boy", "water", "poo poo", "pee pee"];
for (let i = 0; i < randomInt(5, 4); i++) {
    const tasks = [];
    for (let j = 0; j < randomInt(5, 2); j++) {
        const task = new Task(`${randomVerbs[randomInt(randomVerbs.length)]} ${randomNouns[randomInt(randomNouns.length)]}`, false);
        tasks.push(task);
    }
    user.staticQuests.makeQuest(`Quests ${i}`, tasks);
}

// ...


const DisplayInteractionManager = (function(body, user) {
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
                        const questPromptBody = make('form.quest-prompt-body', questPrompt);
                        questPromptBody.setAttribute("action", "#");
                        questPromptBody.setAttribute("method", "post");

                            const questNameLabel = make("label", questPromptBody);
                            questNameLabel.setAttribute("for", "get-quest-name");
                            questNameLabel.textContent = "Quest name: ";

                            const questNameInput = make('input#get-quest-name', questNameLabel);
                            questNameInput.setAttribute("type", "text");
                            questNameInput.setAttribute("placeholder", "Name here");
                            

                            const questDueLabel = make("label", questPromptBody);
                            questDueLabel.setAttribute("for", "get-quest-due");
                            questDueLabel.textContent = "Due date: ";

                            const questDueInput = make('input#get-quest-due', questDueLabel); 
                            questDueInput.setAttribute("type", "date");


                            
                            const submitQuest = make('button#submit-quest', questPromptBody);
                            submitQuest.setAttribute("type", "reset");
                            submitQuest.addEventListener("click", onQuestSubmission);
                            submitQuest.textContent = "Ok";
                            

                        const questPromptLow = make('div.quest-prompt-low', questPrompt);

                    const questList = make('ul.quests', questContainer);
                    const compQuestList = make('ul.completed.quests', questContainer);


                const questAdder = make('button.quest-adder', leftSection);
                questAdder.textContent = "+";
                questAdder.addEventListener('click', onAddQuest);



            const rightSection = make('section.right', content);
                const actionsContainer = make('div.actions-container', rightSection);
                    const taskAdder = make('button.task-adder', actionsContainer);
                    taskAdder.textContent = "Add task +";
                    taskAdder.addEventListener('click', onAddTask);
                    
                    const questEnder = make('button.quest-ender', actionsContainer);
                    questEnder.textContent = "End quest ×";
                    questEnder.addEventListener('click', onEndQuest);

                const tasksContainer = make('div.tasks-container', rightSection);
                    const taskList = make('ul.tasks', tasksContainer);
                    const compTaskList = make('ul.completed.tasks', tasksContainer);

        const lowBar = make('div.low-bar', main);
            const nav = make('nav', lowBar);
                const pickStatic = make('button.static-quests', nav);
                pickStatic.setAttribute("type", "button");
                pickStatic.textContent = "Static";
                pickStatic.addEventListener('click', onQuestGroupSelect.bind(pickStatic, user.staticQuests));

                const pickDaily = make('button.daily-quests', nav);
                pickDaily.setAttribute("type", "button");
                pickDaily.textContent = "Daily";
                pickDaily.addEventListener('click', onQuestGroupSelect.bind(pickDaily, user.dailyQuests));

                const pickWeekly = make('button.weekly-quests', nav);
                pickWeekly.setAttribute("type", "button");
                pickWeekly.textContent = "Weekly";
                pickWeekly.addEventListener('click', onQuestGroupSelect.bind(pickWeekly, user.weeklyQuests));
    // ...

    onQuestGroupSelect.call(pickStatic /* since first selected group is set to static */, selectedQuestGroup); // Displays default quest group properly on start 

    function clearDisplayedTasks() {
        taskList.textContent = "";
        compTaskList.textContent = "";
    }

    function clearDisplayedQuests() {
        questList.textContent = "";
        compQuestList.textContent = "";
    }

    function loadFirstQuest() {
        const associatedEntry = query("[data-index='0']", questList);
        reassignSelectionStyle(associatedEntry);
        selectedQuestIndex = 0; 
        loadSelectedQuest();
    }

    function onQuestGroupSelect(questGroup) {
        if (questGroup !== selectedQuestGroup) {
            query(".selected", nav).classList.remove("selected");
        }
        selectedQuestGroup = questGroup;
        this.classList.add("selected");
        loadSelectedQuestGroup();
        
        clearDisplayedTasks();
        const firstQuest = selectedQuestGroup.quests[0];
        if (firstQuest) {
            loadFirstQuest();
        } else {
            selectedQuestIndex = null;
        }
    }

    function loadSelectedQuestGroup() {
        const quests = selectedQuestGroup.quests;
        clearDisplayedQuests();
        clearDisplayedTasks(); 
        for (let i = 0; i < quests.length; i++){
            const entry = make('li'); 
            entry.dataset.index = i;
                const entryButton = make('button.quest-select', entry);
                entryButton.setAttribute("type", "button");
                entryButton.textContent = quests[i].name; 
                entryButton.addEventListener('click', onQuestSelect);

                if (quests[i].dueDate != null){
                    const dueDisplay = make('button.due', entry);
                    dueDisplay.textContent = `[ ${formateDate(quests[i].dueDate)} ]`;
                }

            const moreButton = make('button.more', entry);
                const URI = "http://www.w3.org/2000/svg"
                const moreIcon = document.createElementNS(URI, 'svg');
                moreButton.append(moreIcon);
                moreIcon.setAttribute("viewBox", "0 0 20 20");
                    const iconInternals = document.createElementNS(URI, 'path');
                    iconInternals.setAttribute("d", "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z");
                    iconInternals.setAttribute("fill", "currentColor");
                    moreIcon.append(iconInternals);
                
                const moreOptions = make('div.more-quest-options.hidden', moreButton);
                    const deleteQuest = make('button.delete-quest', moreOptions);
                    deleteQuest.textContent = 'Delete';

                    deleteQuest.addEventListener('click', () => {
                        selectedQuestGroup.removeQuest(i);
                        selectedQuestIndex = null;
                        loadSelectedQuestGroup();
                    });

            moreButton.addEventListener('click', () => {
                toggleClass(moreOptions, 'hidden');
            });

            if (quests[i].isComplete){
                compQuestList.append(entry);
            } else {
                questList.append(entry);
            }
        }
    }

    function onQuestSelect() {
        reassignSelectionStyle(this);

        selectedQuestIndex = this.parentNode.dataset.index;

        loadSelectedQuest();
    }

    function reassignSelectionStyle(newSelected) {
        const lastSelected = query(".selected", questContainer);
        if (lastSelected) lastSelected.classList.remove("selected");
        newSelected.classList.add("selected");
    }


    function loadSelectedQuest() {
        const quest = selectedQuestGroup.quests[selectedQuestIndex];
        clearDisplayedTasks();
        for (let i = 0; i < quest.tasks.length; i++) {
            const entry = make('li'); 
            entry.dataset.index = i;
            const entryLabel = make('label', entry);

            const task = quest.tasks[i];
            entryLabel.textContent = task.description;
            const entryInput = make('input', entryLabel);
            entryInput.type = 'checkbox';

            if (task.isComplete) {
                compTaskList.append(entry);
                entryInput.checked = true;
            } else {
                taskList.append(entry);
            }

            entryInput.addEventListener("change", () => {
                const checked = entryInput.checked;

                let nextList;
                if (checked) {
                    task.complete();
                    nextList = compTaskList;
                } else {
                    task.resetCompletion();
                    nextList = taskList;

                    if (quest.isComplete){
                        const uncompleted = questList.children;
                        quest.resetCompletion();
                        const associatedLiEntry = compQuestList.querySelector(`li[data-index="${selectedQuestIndex}"]`);
                        let foundPlace = false; 
                        loop: for (let i = 0; i < uncompleted.length; i++) {
                            const currentIndex = uncompleted[i].dataset.index;

                            if (currentIndex > selectedQuestIndex) {
                                questList.insertBefore(associatedLiEntry, uncompleted[i]);
                                foundPlace = true;
                                break loop;
                            }
                        }
                        if (!foundPlace) {
                            questList.append(associatedLiEntry);
                        }
                    }
                }


                setTimeout(
                    () => {
                        const completedEntries = nextList.children;
                        if (completedEntries.length > 0){
                            for (let i = 0; i < completedEntries.length; i++){
                                const currentIndex = completedEntries[i].dataset.index;
                                const thisIndex = entry.dataset.index;

                                if (currentIndex > thisIndex) {
                                    nextList.insertBefore(entry, completedEntries[i]);
                                    ConditionallyToggleTaskEnder();
                                    return;
                                }
                            }
                            nextList.append(entry);
                        } else {
                            nextList.append(entry);
                        }

                        ConditionallyToggleTaskEnder();
                    }, 
                    200
                );

            });

            // entryLabel.setAttribute("tabIndex", `${entryInput.tabIndex}`);
            // entryInput.setAttribute("tabIndex", "-1");
            const customCheck = make('span.checkbox', entryLabel);
        }

        if (!quest.isComplete) {
            ConditionallyToggleTaskEnder();
        }

    }

    function ConditionallyToggleTaskEnder() {
        const taskAmount = taskList.children.length;
        const compAmm = compTaskList.children.length;
        if (taskAmount === 0 && compAmm > 0){
            questEnder.classList.add("activated");
        } else {
            questEnder.classList.remove("activated"); //doesn't matter if .activated isn't actually apart of element
        }
    }


    function onQuestSubmission() {
        toggleClass(questAdder, "selected");
        toggleClass(questPrompt, "activated");

        const questName = questNameInput.value;
        const questDue = (Date.parse(questDueInput.value)) ? new Date(questDueInput.value) : null;
        console.log(questDueInput.value);

        console.log({questName, questDue});
        selectedQuestGroup.makeQuest(questName, [], questDue);
        loadSelectedQuestGroup();
        loadFirstQuest();
    }

    function onAddQuest() {
        toggleClass(this, "selected");
        toggleClass(questPrompt, "activated");
    }

    function onEndQuest() {
        const quest = selectedQuestGroup.quests[selectedQuestIndex];
        quest.complete();
        loadSelectedQuestGroup();

        toggleClass(this, 'activated');
    }

    
    function onAddTask(){
        if (selectedQuestIndex != undefined) { // I dont use strict comparison here cause null == undefined only and not anything else
            const wrapperForm = make("form#task-adder-form", taskList);
            wrapperForm.setAttribute("onsubmit", "return false");

            const newTaskInput = make("input#create-new-task", wrapperForm);
            newTaskInput.setAttribute("placeholder", "New task");
            newTaskInput.setAttribute("type", "text");
            newTaskInput.addEventListener("focusout", () => {
                wrapperForm.remove();
            });

            const submit = make("button", wrapperForm);
            submit.textContent = "submit";
            const submitTaskFunc = () => {
                const task = new Task(newTaskInput.value, false);
                selectedQuestGroup.quests[selectedQuestIndex].addTask(task);
                newTaskInput.blur(); //Without this, auto-suggest pop up still is there on firefox
                loadSelectedQuest();
            };
            submit.addEventListener("pointerdown", submitTaskFunc);

            newTaskInput.addEventListener("keydown", (e) => {
                if (e.keyCode === 13){
                    submitTaskFunc();
                }
            });

            newTaskInput.focus();

        }
    }


})(body, user);
