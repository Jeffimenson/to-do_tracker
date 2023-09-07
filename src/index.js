import { format, isToday, isThisWeek } from 'date-fns';
import './style.css';
import {make, query, toggleClass} from './jeffQuery.js';
import {Task, Quest, StaticQuestGroup, DailyQuestGroup, WeeklyQuestGroup, DailyTime, Day, WeeklyTime} from './quests.js';

const body = query('body');

function formatFullDate(date){
    return format(date, 'MM.dd.yy, hh:mm aa');
}

function formatDateToTime(date) {
    return format(date, 'hh:mm aa');
}

function formatDate(date){
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
    const QuestGroupHandler = new Map();
    QuestGroupHandler.set(user.staticQuests, {
        getDueLabel() {
            const questDueLabel = make("label");
            questDueLabel.setAttribute("for", "get-quest-due");
            questDueLabel.textContent = "Due date: ";

            const questDueInput = make('input#get-quest-due', questDueLabel); 
            questDueInput.setAttribute("type", "date");

            return questDueLabel;
        },
        onQuestSubmission() {
            const questName = query('#get-quest-name').value;

            const dueInput = query('#get-quest-due');
            const questDue = (Date.parse(dueInput.value)) ? new Date(dueInput.value) : null;
            
            if (questName.length > 0) {
                toggleClass(questAdder, "selected");

                const questPrompt = query('.quest-prompt');
                toggleClass(questPrompt, "activated");

                selectedQuestGroup.makeQuest(questName, [], questDue);
                DataDisplayer.loadSelectedQuestGroup();
                DataDisplayer.loadFirstQuest();
            }
        },
        getTimeDisplay(quest) {
            const dueDisplay = make('button.due');
            dueDisplay.textContent = formatDate(quest.dueDate);
            return dueDisplay;
        }
    });

    QuestGroupHandler.set(user.dailyQuests, {
        getDueLabel() {
            const questDueLabel = make("label");
            questDueLabel.setAttribute("for", "get-quest-due");
            questDueLabel.textContent = "Due time: ";

            const questDueInput = make('input#get-quest-due', questDueLabel); 
            questDueInput.setAttribute("type", "time");

            return questDueLabel;
        },
        onQuestSubmission() {
            const questName = query('#get-quest-name').value;

            const dueInput = query('#get-quest-due');
            const [hour, minute] = dueInput.value.split(':');
            const questDue = DailyTime(hour, minute);
            
            
            if (questName.length > 0) {
                toggleClass(questAdder, "selected");

                const questPrompt = query('.quest-prompt');
                toggleClass(questPrompt, "activated");

                selectedQuestGroup.makeQuest(questName, [], questDue);
                DataDisplayer.loadSelectedQuestGroup();
                DataDisplayer.loadFirstQuest();
            }
        },
        getTimeDisplay(quest) {
            const dueDisplay = make('button.due');
            dueDisplay.textContent = formatDateToTime(quest.dueDate);
            return dueDisplay;
        }
    });

    
    function _makeDayGetter(dayName, container) {
        const but = make('button.due-day-getter', container);
        but.textContent = dayName;
        but.setAttribute('type', 'button');
        but.dataset.dayId = Day[dayName];
        
    }
    QuestGroupHandler.set(user.weeklyQuests, {
        getDueLabel() {
            const questDueLabel = make("label");
            questDueLabel.setAttribute("for", "get-quest-due");
            questDueLabel.textContent = "Due: ";

            const inputContainer = make('div.due-container', questDueLabel);
            _makeDayGetter('Sun', inputContainer);
            _makeDayGetter('Mon', inputContainer);
            _makeDayGetter('Tue', inputContainer);
            _makeDayGetter('Wed', inputContainer);
            _makeDayGetter('Thu', inputContainer);
            _makeDayGetter('Fri', inputContainer);
            _makeDayGetter('Sat', inputContainer);


            const questDueTimeInput = make('input#get-quest-due', questDueLabel); 
            questDueTimeInput.setAttribute("type", "time");

            return questDueLabel;
        },

    });

    let selectedQuestGroup = user.staticQuests; 
    let selectedQuestIndex;

    // Utility functions
    function reassignSelectionStyle(newSelected) {
        const lastSelected = query(".selected", questContainer);
        if (lastSelected) lastSelected.classList.remove("selected");
        newSelected.classList.add("selected");
    }


    // Section loaders and generators
    const DataDisplayer = function DataDisplayGenerationAndLoading() {
        function loadFirstQuest() {
            const associatedEntry = query("[data-index='0']", questList);
            reassignSelectionStyle(query('.quest-select', associatedEntry));
            selectedQuestIndex = 0; 
            loadSelectedQuest();
        }

        function _createDropdownIcon(){
            const URI = "http://www.w3.org/2000/svg"
            const moreIcon = document.createElementNS(URI, 'svg');
            moreIcon.setAttribute("viewBox", "0 0 20 20");
                const iconInternals = document.createElementNS(URI, 'path');
                iconInternals.setAttribute("d", "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z");
                iconInternals.setAttribute("fill", "currentColor");
                moreIcon.append(iconInternals);

            return moreIcon;
        }

        function _conditionallyToggleTaskEnder() {
            const taskAmount = taskList.children.length;
            const compAmm = compTaskList.children.length;
            if (taskAmount === 0 && compAmm > 0){
                questEnder.classList.add("activated");
            } else {
                questEnder.classList.remove("activated"); //doesn't matter if .activated isn't actually apart of element
            }
        }
        function _generateTaskEntry(quest, taskIndex) {
            const task = quest.tasks[taskIndex];
            const entry = make('li'); 
            entry.dataset.index = taskIndex;
            const entryLabel = make('label', entry);
            const labelText = make('span', entryLabel)
            labelText.textContent = task.description;
                const entryInput = make('input', entryLabel);
                entryInput.type = 'checkbox';

            const moreButton = make('button.more', entry);
                const moreIcon = _createDropdownIcon();
                moreButton.append(moreIcon);
                
                const moreOptions = make('div.more-options.hidden', moreButton);
                    const deleteOption = make('button.delete-option', moreOptions);
                    deleteOption.textContent = 'Delete';

                    deleteOption.addEventListener('click', () => {
                        // Delete task code here
                        quest.removeTask(taskIndex);
                        loadSelectedQuest();
                    });

                    const editName = make('button.edit-name-option', moreOptions);
                    editName.textContent = 'Edit';

                    editName.addEventListener('click', () => {
                        entry.classList.add('hidden');

                        const editor = make('input.name-editor');
                        editor.setAttribute('type', 'text');
                        editor.value = task.description;
                        entry.after(editor);

                        editor.focus();

                        const submitEdit = () => {
                            task.description = editor.value;
                            labelText.textContent = task.description;

                            entry.classList.remove('hidden');
                            
                            editor.remove();
                        };

                        editor.addEventListener('focusout', submitEdit);

                        editor.addEventListener("keydown", (e) => {
                            if (e.keyCode === 13){
                                submitEdit();
                            }
                        });
                    });

            moreOptions.setAttribute('tabindex', 0);
            moreButton.addEventListener('click', () => { 
                const last = query('div.more-options:not(.hidden)', questContainer);
                if (last && last !== moreOptions) {
                    last.classList.add('hidden');
                } 

                toggleClass(moreOptions, 'hidden');
                moreOptions.focus(); 
            });
            moreOptions.addEventListener('blur', (e) => {
                if (!entry.querySelector('.more:hover')){
                    moreOptions.classList.add('hidden');
                }
            })
            
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
                                    _conditionallyToggleTaskEnder();
                                    return;
                                }
                            }
                            nextList.append(entry);
                        } else {
                            nextList.append(entry);
                        }

                        _conditionallyToggleTaskEnder();
                    }, 
                    200
                );
            });

            if (task.isComplete) entryInput.checked = true;

            // entryLabel.setAttribute("tabIndex", `${entryInput.tabIndex}`);
            // entryInput.setAttribute("tabIndex", "-1");
            const customCheck = make('span.checkbox', entryLabel);

            return entry;
        }

        function _clearDisplayedTasks() {
            taskList.textContent = "";
            compTaskList.textContent = "";
        }

        function loadSelectedQuest() {
            const quest = selectedQuestGroup.quests[selectedQuestIndex];
            _clearDisplayedTasks();
            for (let i = 0; i < quest.tasks.length; i++) {
                const entry = _generateTaskEntry(quest, i);
                if (quest.tasks[i].isComplete) {
                    compTaskList.append(entry);
                } else {
                    taskList.append(entry);
                }
            }

            if (!quest.isComplete) {
                _conditionallyToggleTaskEnder();
            }
        }


        function _resetSelectedQuest(){
            selectedQuestIndex = null;
            questEnder.classList.remove("activated"); // In case last selected quest was in a state to be ended, or else questEnder will still show after that quest is deselected
        }

        function _generateQuestEntry(quests, questIndex){
            const entry = make('li'); 
            const i = questIndex;
            entry.dataset.index = i;
                const entryButton = make('button.quest-select', entry);
                entryButton.setAttribute("type", "button");
                entryButton.textContent = quests[i].name; 
                entryButton.addEventListener('click', ButtonHandler.onQuestSelect);

                if (quests[i].dueDate != null){
                    const questGroupHandler = QuestGroupHandler.get(selectedQuestGroup);
                    const timeDisplay = questGroupHandler.getTimeDisplay(quests[i]);
                    entry.append(timeDisplay);
                }

            const moreButton = make('button.more', entry);
                const moreIcon = _createDropdownIcon();
                moreButton.append(moreIcon);

                
                const moreOptions = make('div.more-options.hidden', moreButton);
                    const deleteQuest = make('button.delete-option', moreOptions);
                    deleteQuest.textContent = 'Delete';

                    deleteQuest.addEventListener('click', () => {
                        selectedQuestGroup.removeQuest(i);
                        _resetSelectedQuest();
                        loadSelectedQuestGroup();
                    });

                    const editQuestName = make('button.edit-name-option', moreOptions);
                    editQuestName.textContent = 'Edit';

                    editQuestName.addEventListener('click', () => {
                        entry.classList.add('hidden');

                        const editor = make('input.name-editor');
                        editor.setAttribute('type', 'text');
                        editor.value = quests[i].name;
                        entry.after(editor);

                        editor.focus();

                        const submitEdit = () => {
                            quests[i].name = editor.value;
                            entryButton.textContent = quests[i].name;
                            entry.classList.remove('hidden');
                            
                            editor.remove();
                        };
                        editor.addEventListener('focusout', submitEdit);

                        editor.addEventListener("keydown", (e) => {
                            if (e.keyCode === 13){
                                submitEdit();
                            }
                        });
                    });

            moreOptions.setAttribute('tabindex', 0);
            moreButton.addEventListener('click', () => { 
                const last = query('div.more-quest-options:not(.hidden)', questContainer);
                if (last && last !== moreOptions) {
                    last.classList.add('hidden');
                } 

                toggleClass(moreOptions, 'hidden');
                moreOptions.focus(); 
            });
            moreOptions.addEventListener('blur', (e) => {
                if (!entry.querySelector('.more:hover')){
                    moreOptions.classList.add('hidden');
                }
            });

            return entry;
        }
        

        function _clearDisplayedQuests() {
            questList.textContent = "";
            compQuestList.textContent = "";
        }
        function loadSelectedQuestGroup() {
            const quests = selectedQuestGroup.quests;
            _clearDisplayedQuests();
            _clearDisplayedTasks(); 
            for (let i = 0; i < quests.length; i++){
                const entry = _generateQuestEntry(quests, i); 

                if (quests[i].isComplete) {
                    compQuestList.append(entry);
                } else {
                    questList.append(entry);
                }
            }
        }


        function _onQuestSubmission() {
            const questName = query('#get-quest-name').value;

            const dueInput = query('#get-quest-due');
            const questDue = (Date.parse(dueInput.value)) ? new Date(dueInput.value) : null;
            
            if (questName.length > 0) {
                toggleClass(questAdder, "selected");

                const questPrompt = query('.quest-prompt');
                toggleClass(questPrompt, "activated");

                selectedQuestGroup.makeQuest(questName, [], questDue);
                DataDisplayer.loadSelectedQuestGroup();
                DataDisplayer.loadFirstQuest();
            }
        }

        function generateQuestPrompt() {
            const questPrompt = make('div.quest-prompt');
            questContainer.prepend(questPrompt); 
                const questPromptTop = make('div.quest-prompt-top', questPrompt);
                const questPromptBody = make('form.quest-prompt-body', questPrompt);
                questPromptBody.setAttribute('onsubmit', 'return false'); // Might have to change this if I actually make this submit somewhere
                questPromptBody.setAttribute("action", "#");
                questPromptBody.setAttribute("method", "post");

                    const questNameLabel = make("label", questPromptBody);
                    questNameLabel.setAttribute("for", "get-quest-name");
                    questNameLabel.textContent = "Quest name: ";

                    const questNameInput = make('input#get-quest-name', questNameLabel);
                    questNameInput.setAttribute("type", "text");
                    questNameInput.setAttribute("placeholder", "Name here");

                    questNameInput.addEventListener('keyup', (e) => {
                        if (e.keyCode === 13) {
                            _onQuestSubmission();
                            questPromptBody.reset();
                        }
                    });
                    
                    const questGroupHandler = QuestGroupHandler.get(selectedQuestGroup);
                    const questDueLabel = questGroupHandler.getDueLabel();
                    questPromptBody.append(questDueLabel);

                    const submitQuest = make('button#submit-quest', questPromptBody);
                    submitQuest.setAttribute("type", "reset");
                    submitQuest.addEventListener("click", questGroupHandler.onQuestSubmission);
                    submitQuest.textContent = "Ok";

                const questPromptLow = make('div.quest-prompt-low', questPrompt);

                questNameInput.focus(); // Not working for some reason :(
        }

        return {
            loadFirstQuest,
            loadSelectedQuest,
            loadSelectedQuestGroup,
            generateQuestPrompt
        };
    }();

    const ButtonHandler = function ButtonEventHandler(DataDisplayer) {
        function onAddTask() {
            if (selectedQuestIndex != undefined) { // I dont use strict comparison here cause null == undefined only and not anything else
                const wrapperForm = make("form#task-adder-form", taskList);
                wrapperForm.setAttribute("onsubmit", "return false"); // Might have to change this if I actually make this submit somewhere

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
                    DataDisplayer.loadSelectedQuest();
                };
                submit.addEventListener("pointerdown", submitTaskFunc);

                newTaskInput.addEventListener("keyup", (e) => {
                    if (e.keyCode === 13){
                        submitTaskFunc();
                    }
                });

                newTaskInput.focus();
            }
        }

        function onAddQuest() {
            toggleClass(this, "selected");

            const lastPrompt = query(".quest-prompt");
            toggleClass(lastPrompt, "activated");
        }

        function onEndQuest() {
            const quest = selectedQuestGroup.quests[selectedQuestIndex];
            quest.complete();
            DataDisplayer.loadSelectedQuestGroup();

            toggleClass(this, 'activated');
        }

        function onQuestSelect() {
            reassignSelectionStyle(this);
            selectedQuestIndex = this.parentNode.dataset.index;
            DataDisplayer.loadSelectedQuest();
        }

        function onQuestGroupSelect(questGroup) {
            if (questGroup !== selectedQuestGroup) {
                query(".selected", nav).classList.remove("selected");
            }
            selectedQuestGroup = questGroup;
            this.classList.add("selected");
            DataDisplayer.loadSelectedQuestGroup();
            
            const firstQuest = selectedQuestGroup.quests[0];
            if (firstQuest) {
                DataDisplayer.loadFirstQuest();
            } else {
                selectedQuestIndex = null;
            }


            const oldPrompt = query('.quest-prompt');
            if (oldPrompt) {
                oldPrompt.remove();

                const selectedAdder = query('.quest-adder.selected');
                if (selectedAdder) {
                    selectedAdder.classList.remove('selected');
                }
            }

            DataDisplayer.generateQuestPrompt();
        }

        return {
            onAddTask,
            onAddQuest,
            onEndQuest, 
            onQuestSelect,
            onQuestGroupSelect 
        };
    }(DataDisplayer); 

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
                    const compQuestList = make('ul.completed.quests', questContainer);

                const questAdder = make('button.quest-adder', leftSection);
                questAdder.textContent = "+";
                questAdder.addEventListener('click', ButtonHandler.onAddQuest);

            const rightSection = make('section.right', content);
                const actionsContainer = make('div.actions-container', rightSection);
                    const taskAdder = make('button.task-adder', actionsContainer);
                    taskAdder.textContent = "Add task +";
                    taskAdder.addEventListener('click', ButtonHandler.onAddTask);
                    
                    const questEnder = make('button.quest-ender', actionsContainer);
                    questEnder.textContent = "End quest ×";
                    questEnder.addEventListener('click', ButtonHandler.onEndQuest);

                const tasksContainer = make('div.tasks-container', rightSection);
                    const taskList = make('ul.tasks', tasksContainer);
                    const compTaskList = make('ul.completed.tasks', tasksContainer);

        const lowBar = make('div.low-bar', main);
            const nav = make('nav', lowBar);
                const pickStatic = make('button.static-quests', nav);
                pickStatic.setAttribute("type", "button");
                pickStatic.textContent = "Static";
                pickStatic.addEventListener('click', ButtonHandler.onQuestGroupSelect.bind(pickStatic, user.staticQuests));

                const pickDaily = make('button.daily-quests', nav);
                pickDaily.setAttribute("type", "button");
                pickDaily.textContent = "Daily";
                pickDaily.addEventListener('click', ButtonHandler.onQuestGroupSelect.bind(pickDaily, user.dailyQuests));

                const pickWeekly = make('button.weekly-quests', nav);
                pickWeekly.setAttribute("type", "button");
                pickWeekly.textContent = "Weekly";
                pickWeekly.addEventListener('click', ButtonHandler.onQuestGroupSelect.bind(pickWeekly, user.weeklyQuests));
    // ...

    ButtonHandler.onQuestGroupSelect.call(pickStatic /* since first selected group is set to static */, selectedQuestGroup); // Displays default quest group properly on start 

})(body, user);
