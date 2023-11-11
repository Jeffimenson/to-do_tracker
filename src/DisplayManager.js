import {make, query, insertAfter} from './jeffQuery.js';
import { format, isToday, isThisWeek } from 'date-fns';
import { DailyTime } from './quests.js';

function formatDate(date){
    return format(date, 'MM.dd.yy');
}

function formatDateToTime(date) {
    return format(date, 'hh:mm aa');
}

function fixDate(input) {
  let [year, month, day] = input.split('-');
  console.log(month);

  const date = new Date(year, month-1, day, 0, 0, 0);
  return date;
}

// For handling different kinds of input methods for the different quest groups
function getStaticHandler() {
    const getDueInput = () => {
        const questDueInput = make('input#get-quest-due'); 
        questDueInput.setAttribute("type", "date");

        return questDueInput;
    }; 
    const getLabelText = () => "Date: "; 
    const getInputVals = () => {
        const questName = query('#get-quest-name').value;

        const dueInput = query('#get-quest-due');
        const questDue = (Date.parse(fixDate(dueInput.value))) ? fixDate(dueInput.value) : null; // date parse can check if data is valid
        
        if (questName.length > 0) {
            return [questName, questDue];
        }
        return [null, null];

    };
    const getTimeDisplay = (quest) => {
        const dueDisplay = make('button.due');
        dueDisplay.textContent = formatDate(quest.dueDate);
        return dueDisplay;

    }; 

    return {
        getDueInput,
        getLabelText,
        getInputVals, 
        getTimeDisplay
    };
}

function getDailyHandler() {
    const getDueInput = () => {
        const questDueInput = make('input#get-quest-due'); 
        questDueInput.setAttribute("type", "time");

        return questDueInput;
    }; 
    const getLabelText = () => "Time: "; 
    const getInputVals = () => {
        const questName = query('#get-quest-name').value;

        const dueInput = query('#get-quest-due');
        const [hour, minute] = dueInput.value.split(':');
        const questDue = DailyTime(hour, minute);

        if (questName.length > 0) {
            return [questName, questDue];
        }
        return [null, null];
    };
    const getTimeDisplay = (quest) => {
        const dueDisplay = make('button.due');
        dueDisplay.textContent = formatDateToTime(quest.dueDate);
        return dueDisplay;
    }; 

    return {
        getDueInput,
        getLabelText,
        getInputVals, 
        getTimeDisplay
    };
}

function getWeeklyHandler() {
    const getDueInput = () => {}; 
    const getLabelText = () => "Day: "; 
    const getInputVals = () => {};
    const getTimeDisplay = () => {}; 

    return {
        getDueInput,
        getLabelText,
        getInputVals, 
        getTimeDisplay
    };
}

const QGUIHandlers = {
    stat: getStaticHandler(),
    daily: getDailyHandler(),
    weekly: getWeeklyHandler()
}
// ...


function createDropdownIcon(){
    const URI = "http://www.w3.org/2000/svg"
    const moreIcon = document.createElementNS(URI, 'svg');
    moreIcon.setAttribute("viewBox", "0 0 20 20");
        const iconInternals = document.createElementNS(URI, 'path');
        iconInternals.setAttribute("d", "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z");
        iconInternals.setAttribute("fill", "currentColor");
        moreIcon.append(iconInternals);

    return moreIcon;
}

const questCompletionChanged = new Event("quest completion changed");

class QuestsDisplayer { // For purely converting user quest data into visual form
    // quest display dom items
    #questContainer;
    #questList;
    #completedQuestList; 
    #questAdder;
    
    #selectedQuestIndex;

    #tasksDisplayer; // reference to task displayer from main displaymanager

    constructor (questContainer, questList, completedQuestList, questAdder, tasksDisplayer) {
        this.#questContainer = questContainer;
        this.#questList = questList;
        this.#completedQuestList = completedQuestList;
        this.#questAdder = questAdder;
        this.#tasksDisplayer = tasksDisplayer; 

    }

    clearDisplayedQuests() {
        this.#questList.textContent = "";
        this.#completedQuestList.textContent = "";
    }


    #onQuestDeletion(questGroup, index) {
        questGroup.removeQuest(index);
        // _resetSelectedQuest();
        this.clearDisplayedQuests(); 
        this.#selectedQuestIndex = 0;
        this.displayQuests(questGroup); 

    }

    #activateEditMode(entry, entryButton, quest) {
        entry.classList.add('hidden');

        const editor = make('input.name-editor');
        editor.setAttribute('type', 'text');
        editor.value = quest.name;
        insertAfter(entry, editor);

        editor.focus();

        const submitEdit = () => {
            quest.name = editor.value;
            entryButton.textContent = quest.name;
            entry.classList.remove('hidden');
            
            editor.remove();
        };

        editor.addEventListener('focusout', submitEdit);
        editor.addEventListener('keydown', (e) => { if (e.keyCode === 13) submitEdit() });
    }

    #toggleQuestOptions(optionsDisplay) {
        const lastOptionsOpened = query('div.more-options:not(.hidden)');
        if (lastOptionsOpened && lastOptionsOpened !== optionsDisplay) {
            lastOptionsOpened.classList.add('hidden');
        } 

        optionsDisplay.classList.toggle('hidden');
        optionsDisplay.focus(); 
    }

    #closeOptionsByClickingElsewhere(entry, moreOptions) {
        if (!entry.querySelector('.more:hover')){
            moreOptions.classList.add('hidden');
        }
    }

    #setStylingAsSelected(newSelected) {
        const lastSelected = query(".selected", this.#questContainer);
        if (lastSelected) lastSelected.classList.remove("selected");
        newSelected.classList.add("selected");
    }

    #selectQuest(quest, entryButton, index) {
        this.#setStylingAsSelected(entryButton);
        this.#tasksDisplayer.displayTasks(quest);
        this.#selectedQuestIndex = index; 
    }

    #generateQuestEntry(quest, index, questGroup) {
        const entry = make('li'); 
        entry.dataset.index = index;

        // Make button that you click to select the quest (takes up 90% of the quest slot space)
        const entryButton = make('div.quest-select', entry); // Can't be real button or else dragging won't work on firefox
        entryButton.setAttribute("tabIndex", 0); // Put tab index on manually since entryButton is not a real button (but interacting still doesn't work)
        entryButton.setAttribute("type", "button");
        entryButton.textContent = quest.name; 
        entryButton.addEventListener('click', this.#selectQuest.bind(this, quest, entryButton, index));

        const hasDueDate = quest.dueDate != null;
        if (hasDueDate) {
            const timeDisplay = QGUIHandlers[questGroup.QGType].getTimeDisplay(quest);
            entry.append(timeDisplay);
        }

        const moreButton = make('button.more', entry);
        const moreIcon = createDropdownIcon();
        moreButton.append(moreIcon);

        const moreOptions = make('div.more-options.hidden', moreButton);

        const deleteQuest = make('button.delete-option', moreOptions);
        deleteQuest.textContent = 'Delete';
        deleteQuest.addEventListener('click', this.#onQuestDeletion.bind(this, questGroup, index));

        const editQuestName = make('button.edit-name-option', moreOptions);
        editQuestName.textContent = 'Edit';
        editQuestName.addEventListener('click', this.#activateEditMode.bind(null, entry, entryButton, quest));

        moreButton.addEventListener('click', this.#toggleQuestOptions.bind(null, moreOptions));
        moreButton.addEventListener('blur', this.#closeOptionsByClickingElsewhere.bind(null, entry, moreOptions));

        return entry;
    }


    displayQuests(questGroup) {
        this.clearDisplayedQuests(); 

        const quests = questGroup.quests; 
        let selectedAQuest = false; 

        const entries = [];
        for (let i = 0; i < quests.length; i++){
            const entry = this.#generateQuestEntry(quests[i], i, questGroup); 
            if (this.#selectedQuestIndex === i) {
                this.#selectQuest(quests[i], entry.querySelector('div.quest-select'), i);
                selectedAQuest = true; 
            }

            if (quests[i].isComplete) {
                this.#completedQuestList.append(entry);
            } else {
                this.#questList.append(entry);
            }
            entries.push(entry);
        }

        if (!selectedAQuest) this.#tasksDisplayer.clearDisplayedTasks(); 


    }
}


class TasksDisplayer { // For purely converting user quest data into visual form
    #taskContainer;
    #taskList; 
    #completedTaskList; 

    clearDisplayedTasks() {
        this.#taskList.textContent = "";
        this.#completedTaskList.textContent = "";
    }

    constructor (taskContainer, taskList, completedTaskList) {
        this.#taskContainer = taskContainer; 
        this.#taskList = taskList;
        this.#completedTaskList = completedTaskList;
    }

    #deleteTask(quest, taskIndex) {
        quest.removeTask(taskIndex);
        this.displayTasks(quest);
    }

    #toggleMoreTaskOptions(moreOptions) {
        const last = query('div.more-options:not(.hidden)', this.#taskContainer);
        if (last && last !== moreOptions) {
            last.classList.add('hidden');
        } 

        moreOptions.classList.toggle('hidden');
        moreOptions.focus(); 
    }

    #generateTaskEntry(quest, taskIndex) {
        const task = quest.tasks[taskIndex];

        const entry = make('li'); 
        entry.dataset.index = taskIndex;

        const entryLabel = make('label', entry); // holds task's text and inputters 

        const labelText = make('span', entryLabel);
        labelText.textContent = task.description;

        const entryInput = make('input', entryLabel);
        entryInput.type = 'checkbox';
        const customCheck = make('span.checkbox', entryLabel);
        entryInput.checked = task.isComplete;

        const moreButton = make('button.more', entry);
        moreButton.append(createDropdownIcon());
        
        const moreOptions = make('div.more-options.hidden', moreButton);
        moreOptions.setAttribute('tabindex', 0);
        moreOptions.addEventListener('blur', this.#toggleMoreTaskOptions.bind(this, moreOptions));

        moreButton.addEventListener('click', this.#toggleMoreTaskOptions.bind(this, moreOptions));

        const deleteOption = make('button.delete-option', moreOptions);
        deleteOption.textContent = 'Delete';
        deleteOption.addEventListener('click', this.#deleteTask.bind(this, quest, taskIndex));

        const editName = make('button.edit-name-option', moreOptions);
        editName.textContent = 'Edit';
        // editName.addEventListener('click', _onEditTaskName);


        entryInput.addEventListener("change", () => {
            const checked = entryInput.checked;
            let questStateChanged = false; 

            let nextList;
            if (checked) {
                task.complete();
                nextList = this.#completedTaskList;

                if (quest.tasks.length === quest.completedTasks.length) {
                    quest.complete();
                    document.dispatchEvent(questCompletionChanged);
                    questStateChanged = true; 
                }
            } else {
                task.resetCompletion();
                nextList = this.#taskList;
                
                
                if (quest.isComplete){
                    quest.resetCompletion();
                    document.dispatchEvent(questCompletionChanged);
                    questStateChanged = true; 
                }
            }

            if (!questStateChanged) {
                setTimeout(
                    () => {
                        const entries = nextList.children;
                        if (entries.length > 0){
                            for (let i = 0; i < entries.length; i++) {
                                const currentIndex = entries[i].dataset.index;
                                const thisIndex = entry.dataset.index;

                                if (currentIndex > thisIndex) {
                                    nextList.insertBefore(entry, entries[i]);
                                    return;
                                }
                            }
                            nextList.append(entry);
                        } else {
                            nextList.append(entry);
                        }

                    }, 
                    200
                );
            }
        });

        return entry;

    }

    displayTasks(quest) {
        this.clearDisplayedTasks();

        for (let i = 0; i < quest.tasks.length; i++) {
            const entry = this.#generateTaskEntry(quest, i);
            if (quest.tasks[i].isComplete) {
                this.#completedTaskList.append(entry);
            } else {
                this.#taskList.append(entry);
            }
        }
    }
}

class DisplayManager {
    #user; // stored data

    // temp data
    #selectedQuestGroup;
    #QGUIHandler;

    // stuff translating data into visuals in UI
    #tasksDisplayer; 
    #questsDisplayer;

    // nav bar elements (stuff that lets pick current QG)
    #nav;
    #QGPickers = {
        stat: null,
        daily: null,
        weekly: null
    }

    // for "actions container" (has buttons that manage the currently selected quest)
    #actionsContainer;
    #taskAdder; 
    #questEnder; 

    // quest prompt stuff
    #questAdder;
    #questPrompt; 
    #questPromptBody;
    #questNameLabel; 
    #questNameInput; 
    #questDueLabel; 
    #submitQuest;

    constructor (user, nav, rightSection, leftSection) {
        this.#user = user;

        this.#makeActionButtons(rightSection); // For buttons on the right section that adds tasks and completes quests

        this.#setupTaskDisplayer(rightSection); // tasks displayer must be made before quest displayer cause quest displayer references it 
        this.#setupQDerHandling(leftSection); // for quest display

        this.#makeNavBar(nav); // create nav bar items

        document.addEventListener("quest completion changed", () => {
            this.#questsDisplayer.displayQuests(this.#selectedQuestGroup);
        });

    }

    #makeNavBar(nav) {
        this.#nav = nav; 
        
        this.#QGPickers.stat = make('button.static-quests', this.#nav);
        this.#QGPickers.stat.setAttribute("type", "button");
        this.#QGPickers.stat.textContent = "Static";

        this.#QGPickers.daily = make('button.daily-quests', this.#nav);
        this.#QGPickers.daily.setAttribute("type", "button");
        this.#QGPickers.daily.textContent = "Daily";

        this.#QGPickers.weekly = make('button.weekly-quests', this.#nav);
        this.#QGPickers.weekly.setAttribute("type", "button");
        this.#QGPickers.weekly.textContent = "Weekly";

        this.#functionizeQGPickers();
    }

    #generateQuestPromptDueInput() {
        this.#questDueLabel.textContent = this.#QGUIHandler.getLabelText();
        this.#questDueLabel.append(this.#QGUIHandler.getDueInput())
    }
    
    #functionizeQGPickers() {
        for (const [QGKey, picker] of Object.entries(this.#QGPickers)) {
            picker.addEventListener('click', () => {
                const chosenQG = this.#user.questGroups[QGKey];

                if (chosenQG !== this.#selectedQuestGroup) {
                    query(".selected", this.#nav)?.classList.remove("selected");
                }

                this.#tasksDisplayer.clearDisplayedTasks();
                this.#selectedQuestGroup = chosenQG;
                this.#QGUIHandler = QGUIHandlers[this.#selectedQuestGroup.QGType];
                picker.classList.add("selected");

                this.#generateQuestPromptDueInput();

                this.#questsDisplayer.displayQuests(chosenQG);
            }); 
        }
    }


    #makeActionButtons(rightSection) {
        this.#actionsContainer = make('div.actions-container', rightSection);  
        this.#taskAdder = make('button.task-adder', this.#actionsContainer);
        this.#taskAdder.textContent = "Add task +";

        this.#questEnder = make('button.quest-ender', this.#actionsContainer);
        this.#questEnder.textContent = "End quest ×";
    }

    #openQuestPrompt() {
        this.classList.toggle("selected");
        const lastPrompt = query(".quest-prompt");
        lastPrompt.classList.toggle("activated")

    }

    #setupQDerHandling(leftSection) {
        // sets up quest container can quest displayer object
        const questContainer = make('div.quest-container', leftSection);

        const questList = make('ul.quests', questContainer);
        const completedQuestList = make('ul.completed.quests', questContainer);

        this.#questAdder = make('button.quest-adder', leftSection);
        this.#questAdder.textContent = "+";
        this.#questAdder.addEventListener('click', this.#openQuestPrompt);
        
        this.#questsDisplayer = new QuestsDisplayer(questContainer, questList, completedQuestList, this.#questAdder, this.#tasksDisplayer);
        // ...

        this.#makeQuestPrompt(questContainer); // For making UI box that lets user add new quests
    }

    #makeQuestPrompt(questContainer) {
        this.#questPrompt = make('div.quest-prompt');
        questContainer.prepend(this.#questPrompt); 

        make('div.quest-prompt-top', this.#questPrompt); // just for decor

        this.#questPromptBody = make('form.quest-prompt-body', this.#questPrompt);
        this.#questPromptBody.setAttribute('onsubmit', 'return false'); // Might have to change this if I actually make this submit somewhere
        this.#questPromptBody.setAttribute("action", "#");
        this.#questPromptBody.setAttribute("method", "post");

        this.#questNameLabel = make("label", this.#questPromptBody);
        this.#questNameLabel.setAttribute("for", "get-quest-name");
        this.#questNameLabel.textContent = "Quest name: ";

        this.#questNameInput = make('input#get-quest-name', this.#questNameLabel);
        this.#questNameInput.setAttribute("type", "text");
        this.#questNameInput.setAttribute("placeholder", "Name here");

        this.#questDueLabel = make("label", this.#questPromptBody); // Just the label (we add input inside it dynamically later depending on selected quest group)
        this.#questDueLabel.setAttribute("for", "get-quest-due");
        this.#questDueLabel.textContent = "Due: ";

        this.#submitQuest = make('button#submit-quest', this.#questPromptBody);
        this.#submitQuest.setAttribute("type", "reset");
        this.#submitQuest.textContent = "Ok";

        this.#submitQuest.addEventListener('click', () => {
            const [questName, questDue] = this.#QGUIHandler.getInputVals();
            if (questName != null) {
                console.log({questName, questDue});

                // toggleClass(questAdder, "selected");
                this.#questAdder.classList.toggle("selected");
                // toggleClass(questPrompt, "activated");
                this.#questPrompt.classList.toggle("activated");

                console.log(questDue);
                if (questDue) {
                    this.#selectedQuestGroup.makeQuest(questName, [], questDue);
                } else {
                    this.#selectedQuestGroup.makeQuest(questName, []);
                }
                // this.#selectedQuestGroup.makeQuest(questName, [], questDue);
                this.#questsDisplayer.displayQuests(this.#selectedQuestGroup);
                // DataDisplayer.loadSelectedQuestGroup();
                // DataDisplayer.loadFirstQuest();
            }

        });

        make('div.quest-prompt-low', this.#questPrompt); // also just for decor
    }

    #setupTaskDisplayer(rightSection) {
        const tasksContainer = make('div.tasks-container', rightSection);
        const taskList = make('ul.tasks', tasksContainer);
        const compTaskList = make('ul.completed.tasks', tasksContainer);

        this.#tasksDisplayer = new TasksDisplayer(tasksContainer, taskList, compTaskList);

    }
}

export default DisplayManager; 