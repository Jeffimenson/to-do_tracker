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

class QuestDisplayer { // For purely converting user quest data into visual form
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
}

class TaskDisplayer { // For purely converting user quest data into visual form
    taskContainer;
    taskList; 
    completedTaskList; 

    constructor (taskContainer, taskList, completedTaskList) {
        this.taskContainer = taskContainer; 
        this.taskList = taskList;
        this.completedTaskList = completedTaskList;
    }
}

class DisplayManager {
    // data
    #user; 
    #selectedQuest;
    #selectedQG;

    // data handling helpers
    #taskDisplayer; 
    #questDisplayer;

    // dom elements
    #nav;
    #staticPicker;
    #dailyPicker; 
    #weeklyPicker;

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

        // create nav bar items
        this.#nav = nav; 
        this.#staticPicker = make('button.static-quests', this.#nav);
        this.#staticPicker.setAttribute("type", "button");
        this.#staticPicker.textContent = "Static";

        this.#dailyPicker = make('button.daily-quests', this.#nav);
        this.#dailyPicker.setAttribute("type", "button");
        this.#dailyPicker.textContent = "Daily";

        this.#weeklyPicker = make('button.weekly-quests', this.#nav);
        this.#weeklyPicker.setAttribute("type", "button");
        this.#weeklyPicker.textContent = "Weekly";
        // ...

        // For buttons on the right section that adds tasks and completes quests
        this.#actionsContainer = make('div.actions-container', rightSection);  
        this.#taskAdder = make('button.task-adder', this.#actionsContainer);
        this.#taskAdder.textContent = "Add task +";

        this.#questEnder = make('button.quest-ender', this.#actionsContainer);
        this.#questEnder.textContent = "End quest ×";
        // ...

        // for quest display
        const questContainer = make('div.quest-container', leftSection);

        const questList = make('ul.quests', questContainer);
        const completedQuestList = make('ul.completed.quests', questContainer);

        const questAdder = make('button.quest-adder', leftSection);
        questAdder.textContent = "+";
        
        this.#questDisplayer = new QuestDisplayer(questContainer, questList, completedQuestList, questAdder);
        // ...

        // declares quest prompt stuff
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
        // ...

        // declares tasks stuff 
        const tasksContainer = make('div.tasks-container', rightSection);
        const taskList = make('ul.tasks', tasksContainer);
        const compTaskList = make('ul.completed.tasks', tasksContainer);
        // ...

        this.#taskDisplayer = new TaskDisplayer(tasksContainer, taskList, compTaskList);

    }
}

export default DisplayManager; 