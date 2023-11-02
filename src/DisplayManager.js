import {make} from './jeffQuery.js';

// For handling different kinds of input methods for the different quest groups
function getStaticQuestHandler() {
    const getDueLabel = () => {}; 
    const onQuestSubmission = () => {};
    const getTimeDisplay = () => {}; 

    return {
        getDueLabel,
        onQuestSubmission, 
        getTimeDisplay
    };
}

function getDailyQuestHandler() {
    const getDueLabel = () => {}; 
    const onQuestSubmission = () => {};
    const getTimeDisplay = () => {}; 

    return {
        getDueLabel,
        onQuestSubmission, 
        getTimeDisplay
    };
}

function getWeeklyQuestHandler() {
    const getDueLabel = () => {}; 
    const onQuestSubmission = () => {};
    const getTimeDisplay = () => {}; 

    return {
        getDueLabel,
        onQuestSubmission, 
        getTimeDisplay
    };
}
// ...

class QuestsDisplayer { // For purely converting user quest data into visual form
    // quest display dom items
    #questContainer;
    #questList;
    #completedQuestList; 
    #questAdder; 

    constructor (questContainer, questList, completedQuestList, questAdder) {
        this.#questContainer = questContainer;
        this.#questList = questList;
        this.#completedQuestList = completedQuestList;
        this.#questAdder = questAdder;
    }

    clearDisplayedQuests() {
        this.#questList.textContent = "";
        this.#completedQuestList.textContent = "";
    }

    #generateQuestEntry(quest, index) {
        const entry = make('li'); 
        entry.dataset.index = index;

        // Make button that you click to select the quest (takes up 90% of the quest slot space)
        const entryButton = make('div.quest-select', entry); // Can't be real button or else dragging won't work on firefox
        entryButton.setAttribute("tabIndex", 0); // Put tab index on manually since entryButton is not a real button (but interacting still doesn't work)
        entryButton.setAttribute("type", "button");
        entryButton.textContent = quest.name; 

        return entry;
    }

    displayQuestGroup(questGroup) {
        const quests = questGroup.quests; 
        for (let i = 0; i < quests.length; i++){
            const entry = this.#generateQuestEntry(quests[i], i); 

            if (quests[i].isComplete) {
                this.#completedQuestList.append(entry);
            } else {
                this.#questList.append(entry);
            }

        }
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
}

class DisplayManager {
    #user; // stored data
    
    // temp data
    #selectedQuest;
    #selectedQG;

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
    #questPrompt; 
    #questPromptBody;
    #questNameLabel; 
    #questNameInput; 
    #questDueLabel; 
    #submitQuest;

    constructor (user, nav, rightSection, leftSection) {
        this.#user = user;

        this.#makeNavBar(nav); // create nav bar items

        this.#makeActionButtons(rightSection); // For buttons on the right section that adds tasks and completes quests

        this.#setupQDerHandling(leftSection); // for quest display

        this.#setupTaskDisplayer(rightSection);

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

    #functionizeQGPickers() {
        for (const [key, picker] of Object.entries(this.#QGPickers)) {
            picker.addEventListener('click', () => {
                const chosenQG = this.#user.questGroups[key];
                this.#tasksDisplayer.clearDisplayedTasks();
                this.#questsDisplayer.clearDisplayedQuests();
                this.#questsDisplayer.displayQuestGroup(chosenQG);
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

    #setupQDerHandling(leftSection) {
        // sets up quest container can quest displayer object
        const questContainer = make('div.quest-container', leftSection);

        const questList = make('ul.quests', questContainer);
        const completedQuestList = make('ul.completed.quests', questContainer);

        const questAdder = make('button.quest-adder', leftSection);
        questAdder.textContent = "+";
        
        this.#questsDisplayer = new QuestsDisplayer(questContainer, questList, completedQuestList, questAdder);
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